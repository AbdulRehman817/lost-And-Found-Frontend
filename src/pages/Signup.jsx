import React, { useState, useEffect } from "react";

import { useSignUp, useUser, useAuth } from "@clerk/clerk-react";

import { useNavigate, Link } from "react-router-dom";

import { useForm } from "react-hook-form";

import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "../components/ui/form";

import { Input } from "../components/ui/input";

import { Button } from "../components/ui/button";

import { ReuniteLogo } from "../components/icons";

import { Mail, Lock, User, Upload, X } from "lucide-react";

export default function SignUp() {
  const { isLoaded, signUp, setActive } = useSignUp();

  const { getToken } = useAuth();

  const { user } = useUser(); // Current user after session is active

  const navigate = useNavigate();

  const [profileImage, setProfileImage] = useState(null);

  const [imagePreview, setImagePreview] = useState(null);

  const [pendingVerification, setPendingVerification] = useState(false);

  const [code, setCode] = useState("");

  const [error, setError] = useState("");

  const [loading, setLoading] = useState(false);

  const form = useForm({
    defaultValues: {
      username: "",

      email: "",

      password: "",

      confirmPassword: "",
    },
  });

  const handleImageChange = (e) => {
    const file = e.target.files[0];

    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError("Image size must be less than 5MB");

        return;
      }

      setProfileImage(file);

      const reader = new FileReader();

      reader.onloadend = () => setImagePreview(reader.result);

      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setProfileImage(null);

    setImagePreview(null);
  };

  const onSubmit = async (values) => {
    if (!isLoaded) return;

    setError("");

    setLoading(true);

    if (values.password !== values.confirmPassword) {
      setError("Passwords do not match");

      setLoading(false);

      return;
    }

    if (values.password.length < 8) {
      setError("Password must be at least 8 characters");

      setLoading(false);

      return;
    }

    try {
      // Create the sign up with first name, last name, email, and password

      await signUp.create({
        username: values.username,

        firstName: values.firstName,

        lastName: values.lastName,

        emailAddress: values.email,

        password: values.password,
      });

      // Prepare email verification

      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });

      setPendingVerification(true);
    } catch (err) {
      console.error(err);

      setError(
        err?.errors?.[0]?.message || "Sign-up failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  //catch (err) {

  //       console.error(err);
  //       setError("Invalid verification code. Please try again.");
  //           } finally {
  //       setLoading(false);
  //     }

  const onVerify = async () => {
    if (!isLoaded) return;
    setLoading(true);

    setError("");

    try {
      const attempt = await signUp.attemptEmailAddressVerification({ code });

      if (attempt.status === "complete") {
        // Activate session

        await setActive({ session: attempt.createdSessionId });

        // Wait for Clerk to fully register the user

        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Upload profile image

        if (profileImage) {
          try {
            const currentUser = attempt.createdUserId;
            (await attempt.createdSessionId) &&
              user?.setProfileImage({ file: profileImage });
            console.log("Profile image uploaded successfully");
          } catch (imgErr) {
            console.error("Image upload failed:", imgErr);
          }
        }
        const token = await getToken();

        if (token) {
          localStorage.setItem("token", token);
          await fetch(
            "https://net-dareen-abdulrehmankashif-9dc9dc64.koyeb.app/api/v1/profile",
            {
              method: "GET",

              headers: { Authorization: `Bearer ${token}` },
            }
          );
        }
        navigate("/");
      }
    } catch (err) {
      console.error(err);

      setError("Invalid verification code. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const uploadImageAfterSignup = async () => {
      if (user && profileImage && !user.hasImage) {
        try {
          await user.setProfileImage({ file: profileImage });
          console.log("Profile image uploaded successfully");
        } catch (err) {
          console.error("Failed to upload profile image:", err);
        }
      }
    };

    uploadImageAfterSignup();
  }, [user, profileImage]);

  return (
    <div className="min-h-screen flex items-center mx-auto w-full justify-center bg-background bg-animated-mesh px-4 relative overflow-hidden">
      <div className="absolute inset-0 spotlight-primary pointer-events-none"></div>
      <div className="w-full max-w-md">
        <div className="text-center mb-8 mt-8">
          <div className="flex items-center justify-center gap-2 mb-2">
            <ReuniteLogo />
            <span className="text-3xl font-bold text-foreground font-headline">Reunite</span>
          </div>
          <p className="text-muted-foreground">
            {pendingVerification ? "Check your email" : "Create your account"}
          </p>
        </div>

        <div className="glass-panel p-8 rounded-2xl relative z-10 w-full shadow-2xl">
          {error && (
            <div className="bg-destructive/10 border border-destructive/20 text-destructive p-3 rounded-xl mb-6 text-sm">
              {error}
            </div>
          )}

          {!pendingVerification ? (
            <>
              {/* Sign Up Form */}

              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-4"
                >
                  <FormField
                    control={form.control}
                    name="username"
                    rules={{ required: "Username is required" }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Username</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />

                            <Input
                              {...field}
                              placeholder="johndoe"
                              className="pl-10 bg-transparent border-border focus:border-primary rounded-lg"
                            />
                          </div>
                        </FormControl>

                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Profile Image */}

                  <div className="space-y-2">
                    <label>Profile Image </label>
                    <div className="flex items-center gap-4">
                      {imagePreview ? (
                        <div className="relative">
                          <img
                            src={imagePreview}
                            alt="Preview"
                            className="w-20 h-20 rounded-full object-cover border-2 border-border"
                          />

                          <button
                            type="button"
                            onClick={removeImage}
                            className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-1"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ) : (
                        <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center border-2 border-dashed border-border">
                          <Upload className="h-6 w-6 text-muted-foreground" />
                        </div>
                      )}

                      <Input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="cursor-pointer flex-1"
                      />
                    </div>
                  </div>

                  {/* Email */}

                  <FormField
                    control={form.control}
                    name="email"
                    rules={{ required: "Email is required" }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>

                        <FormControl>
                          <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />

                            <Input
                              {...field}
                              type="email"
                              className="pl-10 bg-transparent border-border focus:border-primary rounded-lg"
                              placeholder="you@example.com"
                            />
                          </div>
                        </FormControl>

                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Password */}

                  <FormField
                    control={form.control}
                    name="password"
                    rules={{ required: "Password is required", minLength: 8 }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>

                        <FormControl>
                          <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />

                            <Input
                              {...field}
                              type="password"
                              className="pl-10 bg-transparent border-border focus:border-primary rounded-lg"
                              placeholder="••••••••"
                            />
                          </div>
                        </FormControl>

                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Confirm Password */}

                  <FormField
                    control={form.control}
                    name="confirmPassword"
                    rules={{ required: "Please confirm password" }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confirm Password</FormLabel>

                        <FormControl>
                          <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />

                            <Input
                              {...field}
                              type="password"
                              className="pl-10 bg-transparent border-border focus:border-primary rounded-lg"
                              placeholder="••••••••"
                            />
                          </div>
                        </FormControl>

                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button
                    type="submit"
                    className="w-full btn-premium h-11 rounded-xl font-medium"
                    disabled={loading}
                  >
                    {loading ? "Creating account..." : "Create Account"}
                  </Button>
                </form>
              </Form>

              <p className="text-center text-sm text-muted-foreground mt-6">
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="text-primary hover:underline font-medium"
                >
                  Sign in
                </Link>
              </p>
            </>
          ) : (
            // Verification step

            <div className="space-y-4">
              <p className="text-center text-sm text-muted-foreground">
                Enter the verification code sent to your email
              </p>

              <Input
                placeholder="6-digit code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="text-center text-2xl tracking-widest mt-2"
                maxLength={6}
              />
              <Button
                className="w-full btn-premium h-11 rounded-xl font-medium"
                onClick={onVerify}
                disabled={loading || code.length !== 6}
              >
                {loading ? "Verifying..." : "Verify Email"}
              </Button>
              <Button
                variant="ghost"
                className="w-full"
                onClick={() => setPendingVerification(false)}
              >
                Back to sign up
              </Button>
            </div>
          )}
        </div>

        {/* Terms */}

        <p className="text-center text-xs text-muted-foreground mt-6">
          By continuing, you agree to our{" "}
          <a href="/terms" className="underline hover:text-foreground">
            Terms
          </a>{" "}
          and{" "}
          <a href="/privacy" className="underline hover:text-foreground">
            Privacy Policy
          </a>
          .
        </p>
      </div>
    </div>
  );
}
