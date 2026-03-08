const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("../models/User");
const { parseStudentEmail } = require("../utils/registrationParser");

module.exports = function (passport) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL?.trim(),
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const email = profile.emails[0].value;

          // Check if email is from SUST domain (DISABLED - ALL EMAILS ALLOWED)
          // if (!email.endsWith("@student.sust.edu")) {
          //   return done(null, false, {
          //     message: "Only SUST student emails allowed",
          //   });
          // }

          // Parse email using utility
          const parsed = parseStudentEmail(email);

          let registrationNumber = email.split("@")[0];
          let batch = null;
          let department = null;

          if (parsed.isValid) {
            registrationNumber = parsed.fullRegNumber;
            batch = parsed.batch;
            department = parsed.department;
          }

          let user = await User.findOne({ email });

          if (user) {
            return done(null, user);
          }

          // Create new user
          user = await User.create({
            name: profile.displayName,
            email,
            registrationNumber,
            batch,
            department,
            role: "student",
          });

          done(null, user);
        } catch (err) {
          done(err, null);
        }
      },
    ),
  );

  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findById(id);
      done(null, user);
    } catch (err) {
      done(err, null);
    }
  });
};
