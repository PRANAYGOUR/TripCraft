# 🆕 How to Create an Account & Login

## ✅ What's New

Both the Customer and Admin apps now have **account creation** features. You no longer need test credentials - just create your own account!

---

## 👥 Customer App Signup

1. **Go to:** http://localhost:5173
2. **Click:** "Create New Account"
3. **Fill in:**
   - Full Name: Your name
   - Email: your.email@example.com
   - Password: At least 6 characters
   - Confirm Password: Same password again
4. **Click:** "Create Account"
5. **You'll be logged in automatically!**

---

## 👨‍💼 Admin App Signup

1. **Go to:** http://localhost:5174
2. **Click:** "Create Admin Account"
3. **Fill in:**
   - Full Name: Your name
   - Email: admin.email@example.com
   - Password: At least 6 characters
   - Confirm Password: Same password
   - **Admin Code:** `ADMIN2024` (Required for security)
4. **Click:** "Create Admin Account"
5. **You'll be logged in automatically!**

---

## 🔑 Admin Code

To prevent unauthorized admin access, there's a required admin code:

**Admin Code:** `ADMIN2024`

This prevents anyone from just creating an admin account without permission. You can change this in the `AdminSignupPage.tsx` file if needed.

---

## 📝 Test with Demo Users (Optional)

The system also still supports the original demo credentials if you set up the database:

**Customer Demo:**
- Email: customer@micetravel.com
- Password: demo

**Admin Demo:**
- Email: admin@micetravel.com
- Password: demo

---

## 🚀 Quick Start Now

1. **Start both apps:**
   ```bash
   cd customer && npm run dev
   cd admin && npm run dev
   ```

2. **Create accounts** using the signup forms (no database setup needed!)

3. **Start using the app immediately**

---

## 🔐 What Happens When You Sign Up?

1. Your email and password are sent to Supabase Auth (secure)
2. Your profile is created in the database
3. You're automatically logged in
4. Your data is saved and synced across sessions

---

## ✨ No Setup Required!

You can **skip running** `node setup.js` if you just want to test with new accounts. Just:

1. Create accounts in both apps
2. Test the workflow
3. (Optional) Run setup.js later to add demo data

---

## 🐛 Troubleshooting

### "Network error" when signing up
- Check if Supabase is accessible
- Verify VITE_SUPABASE_URL in .env.local
- Check internet connection

### Admin signup requires code
- Make sure you're entering: `ADMIN2024`
- Double-check for typos

### Can't login after signup
- Check spelling of email address
- Verify password
- Clear browser cache and try again

### "Email already exists"
- Try with a different email address
- Or reset the Supabase database

---

**That's it!** Create an account and start using the app! 🎉
