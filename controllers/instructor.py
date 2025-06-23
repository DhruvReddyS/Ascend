from flask import request, render_template, flash, redirect, url_for, session
from bson import ObjectId
from datetime import datetime, timedelta
import cloudinary.uploader
import json
from app import app, db, courses_collection
from bson import ObjectId, errors as bson_errors
# ========== Instructor Dashboard ==========
@app.route('/instructor/dashboard')
def instructor_dashboard():
    if session.get("role") != "instructor":
        return redirect(url_for("signin_signup"))

    instructor_id = session.get("user_id")
    user = db.users.find_one({"_id": ObjectId(instructor_id)})
    courses = list(db.courses.find({"instructor_id": ObjectId(instructor_id)}))

    published_courses = [c for c in courses if c.get("status") == "published"]
    draft_courses = [c for c in courses if c.get("status") == "draft"]

    total_courses = len(courses)
    total_published = len(published_courses)
    total_drafts = len(draft_courses)
    total_students = sum(c.get("students", 0) for c in published_courses)

    # Parse and stats
    def compute_course_stats(course):
        structure = course.get("structure", {})
        if isinstance(structure, str):
            try: structure = json.loads(structure)
            except: structure = {}
        modules = structure.get("modules", [])
        if isinstance(modules, str):
            try: modules = json.loads(modules)
            except: modules = []
        num_modules = len(modules)
        num_chapters = sum(len(m.get("chapters", [])) for m in modules if isinstance(m, dict))
        num_topics = sum(
            len(c.get("topics", []))
            for m in modules if isinstance(m, dict)
            for c in m.get("chapters", []) if isinstance(c, dict)
        )
        total_duration = sum(
            float(t.get("estimated_time", 0)) / 60
            for m in modules if isinstance(m, dict)
            for c in m.get("chapters", []) if isinstance(c, dict)
            for t in c.get("topics", []) if isinstance(t, dict)
        )
        return {
            "rating": course.get("rating", 0),
            "students": course.get("students", 0),
            "duration": round(total_duration, 1),
            "num_modules": num_modules,
            "num_chapters": num_chapters,
            "num_topics": num_topics
        }

    for course in published_courses + draft_courses:
        if isinstance(course.get("structure"), str):
            try:
                course["structure"] = json.loads(course["structure"])
            except Exception:
                course["structure"] = {"modules": []}
        stats = compute_course_stats(course)
        course.update(stats)
        course["_id"] = str(course["_id"])

    # Profile image
    profile_image_url = (
        user.get("profile_image") or
        user.get("photo_url") or
        url_for("static", filename="images/student6.jpg")
    )

    # Chart 1: Student Enrollments per month (last 6 months)
    today = datetime.utcnow()
    months = []
    for i in reversed(range(6)):
        d = (today.replace(day=1) - timedelta(days=30 * i))
        months.append(d.strftime("%b %Y"))
    enrollments_per_month = [0]*6
    for c in published_courses:
        enrollments = db.enrollments.find({"course_id": ObjectId(c["_id"])})
        for e in enrollments:
            if "enrolled_at" in e and isinstance(e["enrolled_at"], datetime):
                enrolled_month = e["enrolled_at"].strftime("%b %Y")
                if enrolled_month in months:
                    enrollments_per_month[months.index(enrolled_month)] += 1

    # Chart 2: Course Completion Rate (for each course)
    completion_labels = [c.get("title", "Untitled") for c in published_courses]
    completion_rates = []
    for c in published_courses:
        enrollments = list(db.enrollments.find({"course_id": ObjectId(c["_id"])}))
        if enrollments:
            completed = sum(1 for e in enrollments if e.get("progress", 0) >= 100)
            rate = int((completed/len(enrollments))*100) if enrollments else 0
        else:
            rate = 0
        completion_rates.append(rate)

    return render_template(
        "instructor/instructor_dash.html",
        user=user,
        profile_image_url=profile_image_url,
        published_courses=published_courses,
        draft_courses=draft_courses,
        total_courses=total_courses,
        total_published=total_published,
        total_drafts=total_drafts,
        total_students=total_students,
        total_topics=sum(c["num_topics"] for c in published_courses),
        enrollments_chart_labels=months,
        enrollments_chart_data=enrollments_per_month,
        completion_chart_labels=completion_labels,
        completion_chart_data=completion_rates,
        page="dashboard",
        str=str
    )

# ========== My Courses ==========
@app.route("/instructor/my-courses")
def instructor_my_courses():
    if session.get("role") != "instructor":
        return redirect(url_for("signin_signup"))

    instructor_id = session.get("user_id")
    courses = list(courses_collection.find({"instructor_id": ObjectId(instructor_id)}))

    def compute_course_stats(course):
        structure = course.get("structure", {})
        if isinstance(structure, str):
            try:
                structure = json.loads(structure)
            except Exception:
                structure = {}

        modules = structure.get("modules", [])
        if isinstance(modules, str):
            try:
                modules = json.loads(modules)
            except Exception:
                modules = []

        modules = [m if isinstance(m, dict) else {} for m in modules]

        num_modules = len(modules)
        num_chapters = sum(len(m.get("chapters", [])) for m in modules)
        num_topics = sum(
            len(c.get("topics", []))
            for m in modules
            for c in m.get("chapters", []) if isinstance(c, dict)
        )
        total_duration = sum(
            float(t.get("estimated_time", 0)) / 60
            for m in modules
            for c in m.get("chapters", []) if isinstance(c, dict)
            for t in c.get("topics", []) if isinstance(t, dict)
        )

        return {
            "duration": round(total_duration, 1),
            "num_modules": num_modules,
            "num_chapters": num_chapters,
            "num_topics": num_topics
        }

    # Enrich every course object
    for course in courses:
        # Parse structure if string
        if isinstance(course.get("structure"), str):
            try:
                course["structure"] = json.loads(course["structure"])
            except Exception:
                course["structure"] = {"modules": []}

        # --- Actual enrolled students ---
        course["enrollment_count"] = db.enrollments.count_documents({"course_id": course["_id"]})

        # --- Average rating ---
        reviews = course.get("reviews", [])
        if reviews:
            avg_rating = round(
                sum(float(r.get("stars", 0)) for r in reviews) / len(reviews), 1
            )
        else:
            avg_rating = 0.0
        course["avg_rating"] = avg_rating

        # --- Other stats ---
        stats = compute_course_stats(course)
        course.update(stats)

        # Ensure _id is str for Jinja usage
        course["_id"] = str(course["_id"])

    return render_template("instructor/my_courses.html", courses=courses, page="courses")

# ========== Create Course ==========
@app.route('/instructor/create-course', methods=['GET', 'POST'])
def create_course():
    if session.get("role") != "instructor":
        return redirect(url_for("signin_signup"))

    if request.method == 'POST':
        try:
            user_id = session.get("user_id")
            if not user_id:
                raise Exception("User not logged in")

            title = request.form.get('course_title')
            description = request.form.get('description')
            difficulty = request.form.get('difficulty')
            category = request.form.get('category')
            language = request.form.get('language')
            prerequisites = request.form.get('prerequisites')
            learning_objectives = request.form.get('learning_objectives')
            duration = request.form.get('duration', 0)
            thumbnail = request.files.get('thumbnail')
            structure_json = request.form.get('structure_json')
            submit_type = request.form.get('submit_type')

            if not structure_json:
                raise Exception("Structure data is missing.")
            structure_data = json.loads(structure_json)

            thumbnail_url = ""
            if thumbnail:
                upload_result = cloudinary.uploader.upload(thumbnail)
                thumbnail_url = upload_result.get("secure_url")

            for module in structure_data.get("modules", []):
                for chapter in module.get("chapters", []):
                    for topic in chapter.get("topics", []):
                        topic_id = topic.get("topic_id")
                        content_type = topic.get("content_type")
                        file_field = f"topic_file_{topic_id}"
                        uploaded_file = request.files.get(file_field)

                        if content_type == "link":
                            topic["content_url"] = topic.get("content", "")
                        elif uploaded_file:
                            if content_type == 'video':
                                resource_type = 'video'
                            elif content_type in ['pdf', 'zip', 'other']:
                                resource_type = 'raw'
                            elif content_type == 'image':
                                resource_type = 'image'
                            else:
                                resource_type = 'auto'

                            upload_result = cloudinary.uploader.upload(uploaded_file, resource_type=resource_type)
                            topic["content_url"] = upload_result.get("secure_url")
                        else:
                            topic["content_url"] = ""

                        topic.pop("content", None)

            course_data = {
                "title": title,
                "description": description,
                "difficulty": difficulty,
                "category": category,
                "language": language,
                "prerequisites": prerequisites,
                "learning_objectives": learning_objectives,
                "duration": float(duration),
                "rating": 0,
                "students": 0,
                "thumbnail_url": thumbnail_url,
                "structure": structure_data,
                "instructor_id": ObjectId(user_id),
                "status": "draft" if submit_type == "draft" else "published",
                "created_at": datetime.utcnow()
            }

            courses_collection.insert_one(course_data)
            return redirect(url_for('instructor_my_courses'))

        except Exception as e:
            print("\u274c Course Creation Error:", str(e))
            return render_template('instructor/create_course.html', error="Error: " + str(e), page="create")

    return render_template('instructor/create_course.html', page="create")

# ========== View Course ==========
@app.route("/instructor/course/<course_id>")
def view_course(course_id):
    if session.get("role") != "instructor":
        return redirect(url_for("signin_signup"))

    course = courses_collection.find_one({"_id": ObjectId(course_id)})
    if not course:
        return "Course not found", 404

    if course.get("status") == "draft":
        return redirect(url_for("view_draft_course", course_id=course_id))
    elif course.get("status") == "published":
        return redirect(url_for("view_published_course", course_id=course_id))
    else:
        return "Invalid course status", 400

# ========== View Draft Course ==========
@app.route("/instructor/course/<course_id>/draft")
def view_draft_course(course_id):
    if session.get("role") != "instructor":
        return redirect(url_for("signin_signup"))

    course = courses_collection.find_one({"_id": ObjectId(course_id)})
    if not course or course.get("status") != "draft":
        return "Draft course not found", 404

    # Parse structure
    structure = course.get("structure", {})
    if isinstance(structure, str):
        try:
            structure = json.loads(structure)
        except Exception:
            structure = {}

    modules = structure.get("modules", [])
    if isinstance(modules, str):
        try:
            modules = json.loads(modules)
        except Exception:
            modules = []

    # Normalize modules
    for module in modules:
        module.setdefault("chapters", [])
        for chapter in module["chapters"]:
            chapter.setdefault("topics", [])
            for topic in chapter["topics"]:
                topic.setdefault("title", "")
                topic.setdefault("description", "")
                topic.setdefault("content_type", "")
                topic.setdefault("estimated_time", "0")
                topic.setdefault("content_url", "")  # ✅ ensure content_url exists

    # Stats
    num_modules = len(modules)
    num_chapters = sum(len(m["chapters"]) for m in modules)
    num_topics = sum(len(c["topics"]) for m in modules for c in m["chapters"])
    total_duration = round(sum(
        float(t.get("estimated_time", 0)) / 60
        for m in modules for c in m["chapters"] for t in c["topics"]
    ), 1)

    course["structure"] = {"modules": modules}
    course["num_modules"] = num_modules
    course["num_chapters"] = num_chapters
    course["num_topics"] = num_topics
    course["total_duration"] = total_duration
    course["_id"] = str(course["_id"])
    course["instructor_id"] = str(course.get("instructor_id"))

    user = db.users.find_one({"_id": ObjectId(course["instructor_id"])})

    return render_template(
        "instructor/view_draft_courses.html",
        course=course,
        user=user,
        page="courses"
    )

# ========== View Published Course ==========
from collections import Counter

@app.route("/instructor/course/<course_id>/published")
def view_published_course(course_id):
    if session.get("role") != "instructor":
        return redirect(url_for("signin_signup"))

    course = db.courses.find_one({"_id": ObjectId(course_id)})
    if not course or course.get("status") != "published":
        return "Published course not found", 404

    # Normalize reviews
    reviews = [r for r in course.get("reviews", []) if isinstance(r, dict)]
    for r in reviews:
        r["stars"] = int(r.get("stars", 0))
        r["name"] = r.get("name") or "Anonymous"
        r["review_text"] = r.get("review_text") or ""

        # Format date display
        dt = r.get("date")
        if isinstance(dt, datetime):
            r["date_display"] = dt.strftime('%b %d, %Y')
        elif isinstance(dt, dict) and "$date" in dt:
            try:
                r["date_display"] = datetime.fromtimestamp(int(dt["$date"]) / 1000).strftime('%b %d, %Y')
            except Exception:
                r["date_display"] = "Unknown"
        else:
            r["date_display"] = "Unknown"

        # Fetch profile image from users collection if user_id present
        r["profile_image"] = "/static/images/default_user.png"
        user_id_str = r.get("user_id")
        if user_id_str:
            try:
                user = db.users.find_one({"_id": ObjectId(user_id_str)})
                if user and user.get("profile_image"):
                    r["profile_image"] = user["profile_image"]
                if user and user.get("fullname"):
                    r["name"] = user["fullname"]  # overwrite name with updated fullname
            except Exception:
                pass

    # Ratings distribution for chart (1 to 5 stars)
    star_counts = Counter(r["stars"] for r in reviews if 1 <= r["stars"] <= 5)
    rating_data = [star_counts.get(i, 0) for i in range(1, 6)]

    # Average rating
    avg_rating = round(sum(r["stars"] for r in reviews) / len(reviews), 2) if reviews else 0

    # Completion stats
    completion = course.get("completion_data", {})
    completion_data = [
        completion.get("completed", 0),
        completion.get("in_progress", 0)
    ]

    # Parse structure for stats
    structure = course.get("structure", {})
    if isinstance(structure, str):
        import json
        try:
            structure = json.loads(structure)
        except:
            structure = {}

    course["structure"] = structure
    modules = structure.get("modules", [])
    num_chapters = sum(len(m.get("chapters", [])) for m in modules)
    num_topics = sum(len(c.get("topics", [])) for m in modules for c in m.get("chapters", []))
    total_duration = round(sum(
        float(t.get("estimated_time", 0)) / 60
        for m in modules for c in m.get("chapters", []) for t in c.get("topics", [])
    ), 1)

    course.update({
        "_id": str(course["_id"]),
        "num_modules": len(modules),
        "num_chapters": num_chapters,
        "num_topics": num_topics,
        "total_duration": total_duration,
        "rating_data": rating_data,
        "completion_data": completion_data,
        "avg_rating": avg_rating,
        "reviews": reviews,
        "total_reviews": len(reviews)
    })

    return render_template(
        "instructor/view_published_courses.html",
        course=course,
        page="courses"
    )

@app.route('/instructor/update-course/<course_id>', methods=['GET', 'POST'])
def update_course(course_id):
    if session.get("role") != "instructor":
        return redirect(url_for("signin_signup"))

    try:
        course_obj_id = ObjectId(course_id)
    except bson_errors.InvalidId:
        flash("Invalid course ID.", "danger")
        return redirect(url_for("instructor_dashboard"))

    course = courses_collection.find_one({"_id": course_obj_id})
    if not course or str(course.get("instructor_id")) != session.get("user_id"):
        flash("Unauthorized access or course not found.", "danger")
        return redirect(url_for("instructor_dashboard"))

    if request.method == "POST":
        try:
            title = request.form.get("title", "").strip()
            description = request.form.get("description", "").strip()
            category = request.form.get("category", "").strip()
            language = request.form.get("language", "").strip()
            difficulty = request.form.get("difficulty", "").strip()
            prerequisites = request.form.get("prerequisites", "").strip()
            learning_objectives = request.form.get("learning_objectives", "").strip()
            structure_json = request.form.get("structure_json", "")
            thumbnail = request.files.get("thumbnail")

            if not structure_json:
                flash("Missing structure data.", "danger")
                return redirect(request.url)

            structure = json.loads(structure_json)
            thumbnail_url = course.get("thumbnail_url", "")
            if thumbnail:
                upload_result = cloudinary.uploader.upload(thumbnail)
                thumbnail_url = upload_result.get("secure_url")

            # Build a dict of original content_urls from existing course
            old_structure = course.get("structure", {"modules": []})
            original_urls = {}
            for mod in old_structure.get("modules", []):
                for chap in mod.get("chapters", []):
                    for topic in chap.get("topics", []):
                        original_urls[topic.get("topic_id")] = topic.get("content_url", "")

            # Upload new topic files if any, else fallback to old URLs
            for module in structure.get("modules", []):
                for chapter in module.get("chapters", []):
                    for topic in chapter.get("topics", []):
                        topic_id = topic.get("topic_id")
                        content_type = topic.get("content_type")
                        file_field = f"topic_file_{topic_id}"
                        uploaded_file = request.files.get(file_field)

                        if content_type == "link":
                            continue  # content_url should be passed from form

                        elif uploaded_file:
                            resource_type = "auto"
                            if content_type == "video":
                                resource_type = "video"
                            elif content_type in ["pdf", "zip", "other"]:
                                resource_type = "raw"
                            elif content_type == "image":
                                resource_type = "image"

                            upload_result = cloudinary.uploader.upload(uploaded_file, resource_type=resource_type)
                            topic["content_url"] = upload_result.get("secure_url")
                        else:
                            # Fallback: use existing content_url if not re-uploaded
                            topic["content_url"] = original_urls.get(topic_id, "")

            # Update course document
            courses_collection.update_one(
                {"_id": course_obj_id},
                {"$set": {
                    "title": title,
                    "description": description,
                    "category": category,
                    "language": language,
                    "difficulty": difficulty,
                    "prerequisites": prerequisites,
                    "learning_objectives": learning_objectives,
                    "structure": structure,
                    "thumbnail_url": thumbnail_url
                }}
            )

            flash("Course updated successfully!", "success")
            return redirect(url_for("view_draft_course", course_id=course_id,page="courses"))

        except Exception as e:
            flash(f"Error updating course: {str(e)}", "danger")
            return redirect(request.url)

    # Preload structure for JS
    course["_id"] = str(course["_id"])
    course["instructor_id"] = str(course["instructor_id"])
    course["structure"] = course.get("structure", {"modules": []})

    return render_template("instructor/edit_course.html", course=course,page="courses")

# PUBLISH
@app.route("/instructor/course/<course_id>/publish", methods=["POST"])
def publish_course(course_id):
    if session.get("role") != "instructor":
        return redirect(url_for("signin_signup"))

    courses_collection.update_one(
        {"_id": ObjectId(course_id)},
        {"$set": {"status": "published"}}
    )
    flash("Course published successfully!", "success")
    return redirect(url_for("instructor_my_courses"))

# UNPUBLISH
@app.route("/instructor/course/<course_id>/unpublish", methods=["POST"])
def unpublish_course(course_id):
    if session.get("role") != "instructor":
        return redirect(url_for("signin_signup"))

    courses_collection.update_one(
        {"_id": ObjectId(course_id)},
        {"$set": {"status": "draft"}}
    )
    flash("Course unpublished successfully!", "success")
    return redirect(url_for("instructor_my_courses"))

# DELETE
@app.route("/instructor/course/<course_id>/delete", methods=["POST"])
def delete_course(course_id):
    if session.get("role") != "instructor":
        return redirect(url_for("signin_signup"))
    
    result = courses_collection.delete_one({"_id": ObjectId(course_id)})
    if result.deleted_count == 1:
        flash("Course deleted successfully!", "success")
    else:
        flash("Failed to delete course.", "danger")
    return redirect(url_for("instructor_my_courses"))

# ========== Instructor Profile ==========
@app.route("/instructor/profile")
def instructor_profile():
    if "user_id" not in session or session.get("role") != "instructor":
        return redirect(url_for("signin_signup"))

    user = db.users.find_one({"_id": ObjectId(session["user_id"])})

    # 🔥 Fix: Parse `createdAt` to datetime if it exists
    if user and "createdAt" in user and isinstance(user["createdAt"], dict) and "$date" in user["createdAt"]:
        try:
            user["createdAt"] = datetime.fromisoformat(user["createdAt"]["$date"].replace("Z", "+00:00"))
        except Exception:
            user["createdAt"] = None

    return render_template("instructor/profile.html", user=user,page="profile")

from flask import render_template, session, redirect, url_for
from bson import ObjectId
from collections import Counter
from datetime import datetime

@app.route('/instructor/analytics')
def instructor_analytics():
    if session.get("role") != "instructor":
        return redirect(url_for("signin_signup"))

    instructor_id = ObjectId(session["user_id"])
    courses = list(db.courses.find({"instructor_id": instructor_id}))

    # --- Chart 1: Average Ratings ---
    rating_labels = []
    rating_data = []
    for c in courses:
        rating_labels.append(c.get("title", "Untitled"))
        # Compute average rating from reviews, fallback to stored rating
        reviews = c.get("reviews", [])
        if reviews:
            avg = sum(float(r.get("stars", 0)) for r in reviews) / len(reviews)
        else:
            avg = c.get("rating", 0)
        rating_data.append(round(avg, 2))

    # --- Chart 2: Course Status (Published vs Draft) ---
    published = sum(1 for c in courses if c.get("status") == "published")
    draft = sum(1 for c in courses if c.get("status") != "published")
    status_labels = ["Published", "Draft"]
    status_data = [published, draft]

    # --- Chart 3: Completion Rate (by month) ---
    # Collect all enrollments for this instructor's courses
    course_ids = [c["_id"] for c in courses]
    enrollments = list(db.enrollments.find({"course_id": {"$in": course_ids}}))
    # Calculate completions per month (last 6 months)
    now = datetime.utcnow()
    months = [(now.year, now.month - i if now.month - i > 0 else now.month - i + 12) for i in reversed(range(6))]
    month_labels = []
    month_completions = []
    for y, m in months:
        label = datetime(y, m, 1).strftime("%b %Y")
        month_labels.append(label)
        completions = 0
        for e in enrollments:
            if e.get("progress", 0) >= 100:
                completed = e.get("progress_updates", [])
                # Find last update in this month
                for u in completed:
                    date = u.get("date")
                    if date and isinstance(date, datetime):
                        if date.year == y and date.month == m:
                            completions += 1
                            break
        month_completions.append(completions)

    # --- Chart 4: Enrollments by Language ---
    lang_counter = Counter()
    for c in courses:
        lang = c.get("language", "Unknown")
        course_enrolls = db.enrollments.count_documents({"course_id": c["_id"]})
        lang_counter[lang] += course_enrolls
    language_labels = list(lang_counter.keys())
    language_data = list(lang_counter.values())
    language_colors = ["#3b82f6", "#facc15", "#f87171", "#22d3ee", "#a78bfa", "#fb7185"] * 3

    return render_template(
        "instructor/analytics.html",
        rating_labels=rating_labels,
        rating_data=rating_data,
        status_labels=status_labels,
        status_data=status_data,
        completion_labels=month_labels,
        completion_data=month_completions,
        language_labels=language_labels,
        language_data=language_data,
        language_colors=language_colors[:len(language_labels)]
    )


@app.route("/instructor/settings")
def instructor_settings():
    if "user_id" not in session or session.get("role") != "instructor":
        return redirect(url_for("signin_signup"))

    user = db.users.find_one({"_id": ObjectId(session["user_id"])})
    return render_template("instructor/settings.html", page="settings",user=user)

@app.route("/toggle-theme", methods=["POST"])
def toggle_theme():
    current = request.cookies.get('theme', 'light')
    resp = redirect(request.referrer or url_for("instructor_dashboard"))
    resp.set_cookie('theme', 'dark' if current == 'light' else 'light', max_age=30*24*60*60)
    return resp
import bcrypt

@app.route("/instructor/change-password", methods=["POST"])
def change_password():
    if session.get("role") != "instructor":
        flash("Unauthorized access. Please sign in.", "danger")
        return redirect(url_for("signin_signup"))

    current_password = request.form.get("current_password")
    new_password = request.form.get("new_password")
    confirm_password = request.form.get("confirm_password")

    if not current_password or not new_password or not confirm_password:
        flash("All fields are required.", "warning")
        return redirect(url_for("instructor_settings"))

    user = db.users.find_one({"_id": ObjectId(session["user_id"])})
    if not user:
        flash("User not found.", "danger")
        return redirect(url_for("signin_signup"))

    if not bcrypt.checkpw(current_password.encode('utf-8'), user["password"].encode('utf-8')):
        flash("Current password is incorrect.", "danger")
        return redirect(url_for("instructor_settings"))

    if new_password != confirm_password:
        flash("New password and confirmation do not match.", "warning")
        return redirect(url_for("instructor_settings"))

    hashed_password = bcrypt.hashpw(new_password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
    db.users.update_one({"_id": user["_id"]}, {"$set": {"password": hashed_password}})
    flash("Password changed successfully!", "success")

    return redirect(url_for("instructor_settings"))

@app.route("/instructor/update-profile", methods=["POST"])
def update_profile():
    if "user_id" not in session or session.get("role") != "instructor":
        return redirect(url_for("signin_signup"))

    user_id = ObjectId(session["user_id"])
    fullname = request.form.get("fullname")
    mobile = request.form.get("mobile")

    update_data = {
        "fullname": fullname,
        "mobile": mobile,
        "updatedAt": datetime.utcnow()
    }

    # Handle profile image upload
    if "profile_image" in request.files:
        image_file = request.files["profile_image"]
        if image_file and image_file.filename:
            upload_result = cloudinary.uploader.upload(image_file, folder="ascend/profiles")
            update_data["profile_image"] = upload_result["secure_url"]

    db.users.update_one({"_id": user_id}, {"$set": update_data})
    flash("Profile updated successfully", "success")
    return redirect(url_for("instructor_profile"))

@app.route("/instructor/delete-account", methods=["POST"])
def delete_account():
    if "user_id" not in session or session.get("role") != "instructor":
        return redirect(url_for("signin_signup"))

    result = db.users.delete_one({"_id": ObjectId(session["user_id"])})
    session.clear()
    flash("Your account has been deleted permanently.", "info")
    return redirect(url_for("home"))  # or url_for("signin_signup")
