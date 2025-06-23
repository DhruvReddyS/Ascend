from flask import Flask, render_template, request, redirect, url_for, session, flash
from pymongo import MongoClient
import cloudinary
import cloudinary.uploader
import os
from dotenv import load_dotenv
import bcrypt

# Load environment variables
load_dotenv()

app = Flask(__name__)
app.secret_key = "supersecretkey"  # replace with a secure secret key

# MongoDB connection
client = MongoClient(os.getenv("MONGO_URI"))
db = client.get_default_database()
courses_collection = db["courses"]

# Cloudinary config
cloudinary.config(
    cloud_name=os.getenv("CLOUDINARY_CLOUD_NAME"),
    api_key=os.getenv("CLOUDINARY_API_KEY"),
    api_secret=os.getenv("CLOUDINARY_API_SECRET")
)

# Create admin user if not exists
def create_admin_if_not_exists():
    admin_email = "admin@ascend.com"
    existing_admin = db.users.find_one({"email": admin_email})
    if not existing_admin:
        hashed_password = bcrypt.hashpw("admin123".encode('utf-8'), bcrypt.gensalt())
        db.users.insert_one({
            "fullname": "Super Admin",
            "email": admin_email,
            "mobile": "9999999999",
            "password": hashed_password.decode('utf-8'),
            "role": "admin"
        })
        print("✅ Admin user created")
    else:
        print("ℹ️ Admin user already exists")

# Home route
@app.route("/")
def home():
    return render_template("home.html")

@app.route("/courses")
def courses():
    return render_template("courses.html")

@app.route("/about")
def about():
    return render_template("about.html")


# Sign In / Sign Up
@app.route("/signin-up", methods=["GET", "POST"])
def signin_signup():
    if request.method == "POST":
        action = request.form.get("action")
        email = request.form.get("email", "").strip()
        password = request.form.get("password", "").strip()

        if not email or not password:
            return render_template("signin-up.html",
                                   error="Email and password are required.",
                                   error_type=action,
                                   panel=action)

        if action == "signup":
            fullname = request.form.get("fullname", "").strip()
            mobile = request.form.get("mobile", "").strip()
            role = request.form.get("role", "").strip()

            if not fullname or not mobile or not role:
                return render_template("signin-up.html",
                                       error="All fields are required for signup.",
                                       error_type="signup",
                                       panel="signup")

            if db.users.find_one({"email": email}):
                return render_template("signin-up.html",
                                       error="Email already exists. Please sign in.",
                                       error_type="signup",
                                       panel="signup")

            hashed_pw = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
            db.users.insert_one({
                "fullname": fullname,
                "email": email,
                "mobile": mobile,
                "password": hashed_pw.decode('utf-8'),
                "role": role
            })

            flash("Signup successful! Please sign in.", "success")
            return redirect(url_for("signin_signup"))

        elif action == "signin":
            user = db.users.find_one({"email": email})
            if not user:
                return render_template("signin-up.html",
                                       error="No account found with this email.",
                                       error_type="signin",
                                       panel="signin")

            if not bcrypt.checkpw(password.encode('utf-8'), user['password'].encode('utf-8')):
                return render_template("signin-up.html",
                                       error="Incorrect password.",
                                       error_type="signin",
                                       panel="signin")

            session["user_id"] = str(user["_id"])
            session["role"] = user["role"]

            if user["role"] == "student":
                return redirect("/student/dashboard")
            elif user["role"] == "instructor":
                return redirect("/instructor/dashboard")
            elif user["role"] == "admin":
                return redirect("/admin/dash")
            else:
                return render_template("signin-up.html",
                                       error="Unknown user role. Contact support.",
                                       error_type="signin",
                                       panel="signin")

    return render_template("signin-up.html", panel="signin")

# Logout
@app.route("/logout")
def logout():
    session.clear()
    flash("You have been logged out.", "success")
    return redirect(url_for("signin_signup"))

@app.context_processor
def inject_theme():
    theme = request.cookies.get('theme', 'light')
    return dict(theme=theme)


from controllers.admin import *
from controllers.instructor import *
from controllers.student import *

# Start server
if __name__ == "__main__":
    create_admin_if_not_exists()
    app.run(debug=True)
