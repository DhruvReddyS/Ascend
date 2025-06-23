from flask import request, render_template, redirect, url_for, session , abort ,current_app
from bson import ObjectId
from app import app, db ,enrollments_collection,users_collection 
courses_collection = db.courses
from datetime import datetime
from flask import flash

# ===========================
# Student Dashboard
# ===========================
@app.route("/student/dashboard")
def student_dashboard():
    if session.get("role") != "student":
        return redirect(url_for("signin_signup"))

    student_id = session.get("user_id")
    user = db.users.find_one({"_id": ObjectId(student_id)})
    enrollments = list(db.enrollments.find({"user_id": ObjectId(student_id)}))

    enrolled_courses = []
    for enroll in enrollments:
        course = db.courses.find_one({"_id": enroll["course_id"]})
        if course:
            enrolled_courses.append({
                "id": str(course["_id"]),
                "title": course.get("title", "Untitled"),
                "desc": course.get("description", ""),
                "image": course.get("thumbnail_url", "/static/images/default.jpg"),
                "progress": enroll.get("progress", 0)
            })

    stats = {
        "courses_enrolled": len(enrolled_courses),
        "courses_completed": sum(1 for e in enrollments if e.get("progress", 0) >= 100),
        "assignments": 7,
        "topics_covered": 45
    }

    chart_data = {
        "course_labels": [c["title"] for c in enrolled_courses],
        "course_progress": [c["progress"] for c in enrolled_courses],
        "weekly_days": ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
        "weekly_minutes": [30, 45, 25, 60, 50]
    }

    return render_template("student/student-dashboard.html",
                           user=user,
                           enrolled_courses=enrolled_courses,
                           stats=stats,
                           chart_data=chart_data,
                           page="dashboard")

# ===========================
# My Courses
# ===========================
@app.route("/student/my-courses")
def student_my_courses():
    if session.get("role") != "student":
        return redirect(url_for("signin_signup"))

    user_id = session.get("user_id")
    user = db.users.find_one({"_id": ObjectId(user_id)})

    # Get user's enrollments (assuming enrollment doc has course_id as ObjectId or str)
    enrollments = list(db.enrollments.find({"user_id": ObjectId(user_id)}))

    # Safe ObjectId conversion (if your course_id is stored as string)
    course_ids = [ObjectId(e["course_id"]) if not isinstance(e["course_id"], ObjectId) else e["course_id"] for e in enrollments]
    progress_lookup = {str(e["course_id"]): e.get("progress", 0) for e in enrollments}

    # Fetch only published courses
    courses_cursor = db.courses.find({"_id": {"$in": course_ids}, "status": "published"})
    courses = []
    for course in courses_cursor:
        course_id_str = str(course["_id"])
        instructor = db.users.find_one({"_id": ObjectId(course.get("instructor_id"))}) if course.get("instructor_id") else None
        courses.append({
            "_id": course_id_str,
            "title": course["title"],
            "description": course.get("description", ""),
            "image_url": course.get("thumbnail_url", "/static/images/placeholder.jpg"),
            "progress": progress_lookup.get(course_id_str, 0),
            "instructor_name": instructor.get("fullname") if instructor else "Unknown Instructor",
            "rating": course.get("rating", 0),
            "slug": course.get("slug") or course_id_str,
        })

    return render_template("student/stmycourse.html", user=user, courses=courses, page="my-courses")
# ===========================
# All Courses (Browse)
# ===========================
from bson import ObjectId

@app.route("/student/all-courses")
def student_all_courses():
    if session.get("role") != "student":
        return redirect(url_for("signin_signup"))

    user = db.users.find_one({"_id": ObjectId(session["user_id"])})
    all_courses = list(db.courses.find({"status": "published"}))

    for course in all_courses:
        course["_id"] = str(course["_id"])
        course["title"] = course.get("title", "No Title")
        course["description"] = course.get("description", "No description available.")
        course["rating"] = round(float(course.get("rating", 0)), 1)
        course["thumbnail_url"] = course.get("thumbnail_url", "/static/images/placeholder.jpg")

        # Structure and counts
        structure = course.get("structure", {})
        modules = structure.get("modules", [])
        course["modules_count"] = len(modules)
        course["chapters_count"] = sum(len(m.get("chapters", [])) for m in modules)
        course["topics_count"] = sum(
            len(ch.get("topics", [])) for m in modules for ch in m.get("chapters", [])
        )

        # ----- Calculate total expected time (sum of all topics' estimated_time, in minutes) -----
        total_time = 0  # in minutes
        for module in modules:
            for chapter in module.get("chapters", []):
                for topic in chapter.get("topics", []):
                    try:
                        est = float(topic.get("estimated_time", 0))
                    except Exception:
                        est = 0
                    total_time += est

        course["total_time"] = int(round(total_time))
        # Pretty print: "X hrs Y min" or "Y min"
        if total_time >= 60:
            hours = int(total_time // 60)
            minutes = int(total_time % 60)
            if minutes > 0:
                course["total_time_pretty"] = f"{hours} hrs {minutes} min"
            else:
                course["total_time_pretty"] = f"{hours} hrs"
        else:
            course["total_time_pretty"] = f"{int(total_time)} min"

        # Instructor name
        instructor = None
        if course.get("instructor_id"):
            try:
                instructor = db.users.find_one({"_id": ObjectId(course.get("instructor_id"))})
            except Exception:
                instructor = None
        course["instructor_name"] = instructor.get("fullname") if instructor else "Unknown Instructor"

        # Created at for sorting (safe fallback)
        course["created_at"] = str(course.get("created_at", "2023-01-01T00:00:00"))

    return render_template("student/stallcourse.html",
                           user=user,
                           courses=all_courses,
                           page="all-courses")

from flask import abort, session

from flask import render_template, redirect, url_for, session
from bson import ObjectId

@app.route('/student/course/<course_id>')
def student_view_course(course_id):
    # Require login
    if "user_id" not in session or session.get("role") != "student":
        return redirect(url_for("signin_signup"))

    # Fetch course (must be published)
    course = db.courses.find_one({
        "_id": ObjectId(course_id),
        "status": "published"
    })
    if not course:
        return "Course not found", 404

    # Fetch instructor info
    instructor = None
    if course.get("instructor_id"):
        try:
            instructor = db.users.find_one({"_id": ObjectId(course["instructor_id"])})
        except Exception:
            instructor = None

    # Set instructor fields
    course["instructor_name"] = instructor["fullname"] if instructor else "Unknown Instructor"
    # Premium: try all possible photo fields, fallback
    course["instructor_photo"] = (
        instructor.get("profile_image") or instructor.get("photo_url")
        if instructor and (instructor.get("profile_image") or instructor.get("photo_url"))
        else "/static/images/instructor.jpg"
    )
    course["instructor_tagline"] = instructor.get("tagline", "") if instructor else ""

    # Sidebar thumbnail fallback
    course["thumbnail_url"] = course.get("thumbnail_url", "/static/images/placeholder.jpg")

    # Learning objectives as text (support string or list)
    if isinstance(course.get("learning_objectives"), list):
        course["learning_objectives"] = "\n".join(str(obj) for obj in course["learning_objectives"])
    else:
        course["learning_objectives"] = course.get("learning_objectives", "")

    # ---- STRUCTURE: normalize modules/chapters/topics ----
    structure = course.get("structure", {})
    modules = structure.get("modules", [])
    # Count for sidebar (premium stat)
    modules_count = len(modules)
    chapters_count = 0
    topics_count = 0

    for mod in modules:
        chapters = mod.get("chapters", [])
        mod["chapters"] = chapters
        chapters_count += len(chapters)
        for ch in chapters:
            topics = ch.get("topics", [])
            ch["topics"] = topics
            topics_count += len(topics)
            # Each topic: ensure all required fields (for icon, etc.)
            for topic in topics:
                topic.setdefault("content_type", "other")  # pdf, image, video, link, other
                topic.setdefault("title", "Untitled Topic")

    # Add counts for the sidebar/stat display
    course["structure"] = {"modules": modules}
    course["modules_count"] = modules_count
    course["chapters_count"] = chapters_count
    course["topics_count"] = topics_count

    # For any sidebar ratings/time etc, set here if needed
    course["rating"] = course.get("rating", 0)
    course["students"] = course.get("students", 0)

    # Total time (sum up all topic estimated_time, if present)
    total_time = 0
    for mod in modules:
        for ch in mod["chapters"]:
            for topic in ch["topics"]:
                try:
                    total_time += int(topic.get("estimated_time", 0))
                except Exception:
                    pass
    course["total_time"] = total_time
    # Pretty display, e.g. "3 hrs 30 min"
    hrs = total_time // 60
    mins = total_time % 60
    if hrs and mins:
        course["total_time_pretty"] = f"{hrs} hr {mins} min"
    elif hrs:
        course["total_time_pretty"] = f"{hrs} hr"
    elif mins:
        course["total_time_pretty"] = f"{mins} min"
    else:
        course["total_time_pretty"] = "-"

    return render_template("student/view_course.html", course=course)

from flask import jsonify
from datetime import datetime

@app.route("/student/enroll/<course_id>", methods=["POST"])
def student_enroll_course(course_id):
    if "user_id" not in session or session.get("role") != "student":
        return jsonify({"success": False, "message": "Unauthorized"}), 401

    user_id = session["user_id"]
    user = db.users.find_one({"_id": ObjectId(user_id)})
    if not user:
        return jsonify({"success": False, "message": "User not found"}), 404

    course = db.courses.find_one({"_id": ObjectId(course_id), "status": "published"})
    if not course:
        return jsonify({"success": False, "message": "Course not found"}), 404

    # Already enrolled? (Check both: user & enrollments)
    already_user = user.get("enrolled_courses", [])
    already_enroll = db.enrollments.find_one({"user_id": ObjectId(user_id), "course_id": ObjectId(course_id)})

    if ObjectId(course_id) in [ObjectId(cid) for cid in already_user] or already_enroll:
        return jsonify({"success": False, "message": "Already enrolled in this course."}), 400

    # Add course to user
    db.users.update_one(
        {"_id": ObjectId(user_id)},
        {"$addToSet": {"enrolled_courses": ObjectId(course_id)}}
    )
    # Add to enrollments
    db.enrollments.insert_one({
        "user_id": ObjectId(user_id),
        "course_id": ObjectId(course_id),
        "progress": 0,
        "enrolled_at": datetime.utcnow()
    })

    return jsonify({"success": True, "message": "Successfully enrolled in this course!"})


@app.route("/student/course-player/<course_id>")
def student_course_player(course_id):
    user = db.users.find_one({"_id": ObjectId(session["user_id"])})
    # 1. Require student login (your session convention)
    if "user_id" not in session or session.get("role") != "student":
        return redirect(url_for("signin_signup"))

    # 2. Find course by ObjectId
    course = db.courses.find_one({"_id": ObjectId(course_id)})
    if not course:
        abort(404)

    # 3. Find instructor name, fallback to 'Unknown'
    instructor_name = "Unknown"
    if course.get("instructor_id"):
        instructor = db.users.find_one({"_id": course["instructor_id"]})
        if instructor and instructor.get("fullname"):
            instructor_name = instructor["fullname"]
    course["instructor_name"] = instructor_name

    # 4. Render the Jinja2 template
    return render_template(
        "student/course_player.html",
        course=course,user =user
    )


@app.route("/student/course/<course_id>/review", methods=["POST"])
def student_course_review(course_id):
    # Only allow students
    if session.get("role") != "student":
        return jsonify({"success": False, "msg": "Login required."}), 401

    course = db.courses.find_one({"_id": ObjectId(course_id), "status": "published"})
    if not course:
        return jsonify({"success": False, "msg": "Course not found."}), 404

    student_email = session.get("email")
    # Prevent duplicate reviews by this student email
    if any(r.get("email") == student_email for r in course.get("reviews", [])):
        return jsonify({"success": False, "msg": "You have already reviewed this course."}), 400

    try:
        stars = int(request.form.get("stars", 0))
    except Exception:
        stars = 0
    review_text = (request.form.get("review_text") or "").strip()

    if not (1 <= stars <= 5) or not review_text:
        return jsonify({"success": False, "msg": "All fields required."}), 400

    review = {
        "user_id": session.get("user_id"),  # Store user_id as string for lookup
        "email": student_email,
        "name": session.get("fullname", "Anonymous"),
        "review_text": review_text,
        "stars": stars,
        "date": datetime.utcnow()
    }

    db.courses.update_one(
        {"_id": ObjectId(course_id)},
        {"$push": {"reviews": review}}
    )

    return jsonify({"success": True, "msg": "Review submitted!"}), 200

from flask import jsonify, request

from datetime import datetime

@app.route("/student/update-progress/<course_id>", methods=["POST"])
def update_student_progress(course_id):
    if "user_id" not in session or session.get("role") != "student":
        return "Unauthorized", 401
    user_id = ObjectId(session["user_id"])
    try:
        data = request.get_json(force=True)
        percent = int(data.get("progress", 0))
        topics_completed = int(data.get("topics_completed", 1))  # Default to 1 if not passed

        # Always update progress
        db.enrollments.update_one(
            {"user_id": user_id, "course_id": ObjectId(course_id)},
            {"$set": {"progress": percent}}
        )

        # Log progress update (append for every call, or, if you want, only one log per day)
        today = datetime.utcnow().date()
        # Check if an update for today exists:
        enrollment = db.enrollments.find_one({"user_id": user_id, "course_id": ObjectId(course_id)})
        found = False
        if enrollment and "progress_updates" in enrollment:
            for upd in enrollment["progress_updates"]:
                # If date is a datetime object, compare just date portion:
                if isinstance(upd.get("date"), datetime):
                    upd_date = upd["date"].date()
                else:
                    try:
                        upd_date = datetime.strptime(str(upd.get("date"))[:10], "%Y-%m-%d").date()
                    except Exception:
                        continue
                if upd_date == today:
                    found = True
                    # Optionally, increment topics_completed for today instead of appending a new log
                    db.enrollments.update_one(
                        {
                            "user_id": user_id,
                            "course_id": ObjectId(course_id),
                            "progress_updates.date": upd["date"]
                        },
                        {"$inc": {"progress_updates.$.topics_completed": topics_completed}}
                    )
                    break

        if not found:
            # Add a new log for today
            db.enrollments.update_one(
                {"user_id": user_id, "course_id": ObjectId(course_id)},
                {"$push": {
                    "progress_updates": {
                        "date": datetime.utcnow(),
                        "topics_completed": topics_completed
                    }
                }}
            )

        return "ok"
    except Exception as e:
        return str(e), 400


# ===========================
# Student Analytics
# ===========================
from datetime import datetime, timedelta
@app.route("/student/analytics")
def student_analytics():
    if session.get("role") != "student":
        return redirect(url_for("signin_signup"))

    user_id = ObjectId(session["user_id"])
    user = db.users.find_one({"_id": user_id}) or {}

    # --- 1. Courses Overview ---
    total_courses = db.courses.count_documents({"status": "published"}) or 0
    enrollments = list(db.enrollments.find({"user_id": user_id}))
    enrolled_count = len(enrollments)
    completed_count = sum(1 for e in enrollments if e.get("progress", 0) >= 100)
    courses_overview = {
        "labels": ["Total Published", "Enrolled", "Completed"],
        "datasets": [{
            "label": "Courses",
            "data": [total_courses, enrolled_count, completed_count],
            "backgroundColor": ["#6366f1", "#3b82f6", "#10b981"]
        }]
    }

    # --- 2. Student Leaderboard (Top 5 by completed courses, always show self) ---
    pipeline = [
        {"$match": {"role": "student"}},
        {"$lookup": {
            "from": "enrollments",
            "localField": "_id",
            "foreignField": "user_id",
            "as": "my_enrollments"
        }},
        {"$addFields": {
            "courses_completed": {
                "$size": {
                    "$filter": {
                        "input": "$my_enrollments",
                        "as": "e",
                        "cond": {"$gte": ["$$e.progress", 100]}
                    }
                }
            }
        }},
        {"$sort": {"courses_completed": -1}},
        {"$limit": 5},
        {"$project": {"fullname": 1, "courses_completed": 1}}
    ]
    leaderboard = list(db.users.aggregate(pipeline))
    leader_labels = [u.get("fullname", "Student") for u in leaderboard]
    leader_data = [u.get("courses_completed", 0) for u in leaderboard]
    # Ensure current student is shown even if not top 5:
    user_name = user.get("fullname", "You")
    if user_name not in leader_labels:
        leader_labels.append(user_name)
        leader_data.append(completed_count)
    leaderboard_chart = {
        "labels": leader_labels if leader_labels else ["You"],
        "datasets": [{
            "label": "Courses Completed",
            "data": leader_data if leader_data else [0],
            "backgroundColor": "#3b82f6"
        }]
    }

    # --- 3. Learning Time Comparison (min) ---
    my_minutes = 0
    course_ids = [e.get("course_id") for e in enrollments if e.get("course_id")]
    my_courses = db.courses.find({"_id": {"$in": course_ids}}) if course_ids else []
    for course in my_courses:
        structure = course.get("structure", {})
        total_time = 0
        for m in structure.get("modules", []):
            for ch in m.get("chapters", []):
                for t in ch.get("topics", []):
                    try:
                        total_time += float(t.get("estimated_time", 0))
                    except Exception:
                        pass
        enroll = next((e for e in enrollments if e.get("course_id") == course["_id"]), None)
        percent = enroll.get("progress", 0) if enroll else 0
        my_minutes += int((percent / 100) * total_time) if total_time else 0

    # Aggregate average/top for all students
    pipeline_time = [
        {"$match": {"role": "student"}},
        {"$lookup": {
            "from": "enrollments",
            "localField": "_id",
            "foreignField": "user_id",
            "as": "my_enrollments"
        }},
        {"$unwind": {"path": "$my_enrollments", "preserveNullAndEmptyArrays": True}},
        {"$lookup": {
            "from": "courses",
            "localField": "my_enrollments.course_id",
            "foreignField": "_id",
            "as": "the_course"
        }},
        {"$unwind": {"path": "$the_course", "preserveNullAndEmptyArrays": True}},
        {"$addFields": {
            "course_time": {
                "$reduce": {
                    "input": {
                        "$map": {
                            "input": {
                                "$ifNull": [
                                    {"$getField": {"field": "modules", "input": "$the_course.structure"}}, []
                                ]
                            },
                            "as": "m",
                            "in": {
                                "$sum": {
                                    "$map": {
                                        "input": {"$ifNull": ["$$m.chapters", []]},
                                        "as": "ch",
                                        "in": {
                                            "$sum": {
                                                "$map": {
                                                    "input": {"$ifNull": ["$$ch.topics", []]},
                                                    "as": "t",
                                                    "in": {"$toDouble": {"$ifNull": ["$$t.estimated_time", 0]}}
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    },
                    "initialValue": 0,
                    "in": {"$add": ["$$value", "$$this"]}
                }
            }
        }},
        {"$addFields": {
            "actual_time": {
                "$multiply": [
                    {"$divide": [{"$ifNull": ["$my_enrollments.progress", 0]}, 100]},
                    {"$ifNull": ["$course_time", 0]}
                ]
            }
        }},
        {"$group": {
            "_id": "$_id",
            "fullname": {"$first": "$fullname"},
            "total_time": {"$sum": "$actual_time"}
        }},
        {"$sort": {"total_time": -1}}
    ]
    student_time_stats = list(db.users.aggregate(pipeline_time))
    all_times = [s.get("total_time", 0) for s in student_time_stats if s.get("total_time", 0) > 0]
    avg_time = round(sum(all_times) / len(all_times), 1) if all_times else 0
    top_time = round(max(all_times), 1) if all_times else 0
    time_comparison_chart = {
        "labels": [user_name, "Average", "Top Student"],
        "datasets": [{
            "label": "Learning Time (min)",
            "data": [round(my_minutes, 1), avg_time, top_time],
            "backgroundColor": ["#3b82f6", "#10b981", "#f59e42"]
        }]
    }

    # --- 4. Weekly Activity (last 7 days, topics completed) ---
    today = datetime.utcnow()
    last_week = [today - timedelta(days=i) for i in range(6, -1, -1)]
    week_labels = [d.strftime("%a") for d in last_week]
    daily_counts = [0 for _ in range(7)]
    for enroll in enrollments:
        if "progress_updates" in enroll and enroll["progress_updates"]:
            for update in enroll["progress_updates"]:
                upd_day = update.get("date")
                if isinstance(upd_day, datetime):
                    for idx, dt in enumerate(last_week):
                        if upd_day.date() == dt.date():
                            daily_counts[idx] += update.get("topics_completed", 0)
    weekly_activity_chart = {
        "labels": week_labels,
        "datasets": [{
            "label": "Topics Completed",
            "data": daily_counts,
            "backgroundColor": "#6366f1"
        }]
    }

    # Final fallback for empty charts
    def ensure_chart(chart, empty_labels):
        if not chart.get("labels"): chart["labels"] = empty_labels
        for ds in chart["datasets"]:
            if not ds.get("data"): ds["data"] = [0] * len(chart["labels"])
        return chart

    courses_overview = ensure_chart(courses_overview, ["Total Published", "Enrolled", "Completed"])
    leaderboard_chart = ensure_chart(leaderboard_chart, ["You"])
    time_comparison_chart = ensure_chart(time_comparison_chart, ["You", "Average", "Top Student"])
    weekly_activity_chart = ensure_chart(weekly_activity_chart, week_labels)

    return render_template(
        "student/analytics.html",
        user=user,
        courses_overview=courses_overview,
        leaderboard_chart=leaderboard_chart,
        time_comparison_chart=time_comparison_chart,
        weekly_activity_chart=weekly_activity_chart,
        page="analytics"
    )

# ===========================
# Student Profile
# ===========================
import os

@app.route('/student/profile', methods=['GET', 'POST'])
def student_profile():
    # Ensure user is logged in as student
    if session.get("role") != "student":
        return redirect(url_for("signin_signup"))

    user_id = ObjectId(session["user_id"])
    user = db.users.find_one({"_id": user_id})

    if not user:
        flash("User not found!", "danger")
        return redirect(url_for("signin_signup"))

    if request.method == "POST":
        # Remove photo
        if request.form.get("remove_photo") == "1":
            db.users.update_one({"_id": user_id}, {"$unset": {"profile_image": ""}})
            flash("Profile photo removed.", "success")
            return redirect(url_for('student_profile'))

        # Get form data
        fullname = request.form.get("fullname", "").strip()
        mobile = request.form.get("mobile", "").strip()
        achievements = request.form.get("achievements", "").strip()
        skills = request.form.get("skills", "").strip()
        linkedin = request.form.get("linkedin", "").strip()
        github = request.form.get("github", "").strip()

        update_data = {
            "fullname": fullname,
            "mobile": mobile,
            "achievements": achievements,
            "skills": skills,
            "linkedin": linkedin,
            "github": github
        }

        # Handle profile image upload
        file = request.files.get("profile_image")
        if file and file.filename:
            filename = f"student_{str(user_id)}_{file.filename}"
            upload_dir = os.path.join(current_app.root_path, 'static', 'uploads')
            os.makedirs(upload_dir, exist_ok=True)
            file_path = os.path.join(upload_dir, filename)
            file.save(file_path)
            profile_image_url = f"/static/uploads/{filename}"
            update_data["profile_image"] = profile_image_url

        db.users.update_one({"_id": user_id}, {"$set": update_data})
        session["fullname"] = fullname
        flash("Profile updated!", "success")
        return redirect(url_for('student_profile'))

    return render_template("student/profile.html", user=user, page="profile")

# ===========================
# Student Settings
# ===========================
from flask import request, redirect, url_for, flash, session, render_template
from bson import ObjectId
import bcrypt


@app.route("/student/settings", methods=["GET"])
def student_settings():
    if session.get("role") != "student":
        return redirect(url_for("signin_signup"))

    user_id = session.get("user_id")
    if not user_id:
        return redirect(url_for("signin_signup"))

    # Fetch user from DB - adjust to your user collection
    user = db.users.find_one({"_id": ObjectId(user_id)})
    if not user:
        return redirect(url_for("signin_signup"))

    # Get enrolled courses for this student
    enrolled = enrollments_collection.find({"student_id": ObjectId(user_id)})
    enrolled_course_ids = [e.get("course_id") for e in enrolled]

    # Fetch course details for enrolled courses
    enrolled_courses = list(courses_collection.find({
        "_id": {"$in": enrolled_course_ids},
        "status": "published"
    }))

    return render_template(
        "student/settings.html",
        user=user,
        enrolled_courses=enrolled_courses,
        page="settings"
    )


@app.route("/student/unenroll", methods=["POST"])
def student_unenroll():
    if session.get("role") != "student":
        return jsonify({"success": False, "msg": "Login required."}), 401

    user_id = session.get("user_id")
    if not user_id:
        return jsonify({"success": False, "msg": "Login required."}), 401

    # Support form or JSON payload
    data = request.form or request.get_json() or {}
    course_id = data.get("course_id")
    if not course_id:
        return jsonify({"success": False, "msg": "Course ID is required."}), 400

    try:
        course_oid = ObjectId(course_id)
    except Exception:
        return jsonify({"success": False, "msg": "Invalid Course ID."}), 400

    enrollment = enrollments_collection.find_one({
        "student_id": ObjectId(user_id),
        "course_id": course_oid
    })
    if not enrollment:
        return jsonify({"success": False, "msg": "You are not enrolled in this course."}), 400

    # Delete enrollment record to unenroll
    enrollments_collection.delete_one({"_id": enrollment["_id"]})

    return jsonify({"success": True, "msg": "Unenrolled from course successfully."})


@app.route("/student/change-password", methods=["POST"])
def student_change_password():
    if session.get("role") != "student":
        return jsonify({"success": False, "msg": "Login required."}), 401

    user_id = session.get("user_id")
    if not user_id:
        return jsonify({"success": False, "msg": "Login required."}), 401

    user = users_collection.find_one({"_id": ObjectId(user_id)})
    if not user:
        return jsonify({"success": False, "msg": "User not found."}), 404

    data = request.get_json()
    old_password = data.get("old_password", "")
    new_password = data.get("new_password", "")
    confirm_password = data.get("confirm_password", "")

    if not old_password or not new_password or not confirm_password:
        return jsonify({"success": False, "msg": "All password fields are required."}), 400

    if new_password != confirm_password:
        return jsonify({"success": False, "msg": "New password and confirmation do not match."}), 400

    if not check_password_hash(user["password"], old_password):
        return jsonify({"success": False, "msg": "Current password is incorrect."}), 400

    new_password_hash = generate_password_hash(new_password)
    users_collection.update_one({"_id": ObjectId(user_id)}, {"$set": {"password": new_password_hash}})

    return jsonify({"success": True, "msg": "Password updated successfully."})



@app.route("/student/delete-account", methods=["POST"])
def student_delete_account():
    if session.get("role") != "student":
        return jsonify({"success": False, "msg": "Login required."}), 401

    user_id = session.get("user_id")
    if not user_id:
        return jsonify({"success": False, "msg": "Login required."}), 401

    # Delete enrollments of the user
    enrollments_collection.delete_many({"student_id": ObjectId(user_id)})

    # Delete user document
    users_collection.delete_one({"_id": ObjectId(user_id)})

    # Clear session
    session.clear()

    return jsonify({"success": True, "msg": "Account deleted successfully."})