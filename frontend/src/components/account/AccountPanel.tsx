"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ApiError,
  deleteAccount,
  updatePassword,
  updateUsername,
} from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useAuth } from "@/context/AuthProvider";
import { storeAuth } from "@/lib/auth-storage";

export function AccountPanel() {
  const router = useRouter();
  const { user, token, logout, refreshUser } = useAuth();

  const [usernameForm, setUsernameForm] = useState({
    current_username: user?.username ?? "",
    new_username: "",
  });
  const [passwordForm, setPasswordForm] = useState({
    current_password: "",
    new_password: "",
    confirm_password: "",
  });
  const [deleteForm, setDeleteForm] = useState({
    identifier: user?.email ?? "",
    password: "",
  });

  const [usernameError, setUsernameError] = useState("");
  const [usernameSuccess, setUsernameSuccess] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [deleteError, setDeleteError] = useState("");
  const [isUpdatingUsername, setIsUpdatingUsername] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (!user) return;
    setUsernameForm((current) => ({
      ...current,
      current_username: user.username,
    }));
    setDeleteForm((current) => ({
      ...current,
      identifier: user.email,
    }));
  }, [user]);

  if (!user) return null;

  async function handleUsernameSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setUsernameError("");
    setUsernameSuccess("");
    setIsUpdatingUsername(true);

    try {
      const updatedUser = await updateUsername(usernameForm);
      if (token) storeAuth(token, updatedUser);
      await refreshUser();
      setUsernameSuccess("Username updated successfully.");
      setUsernameForm((current) => ({
        current_username: updatedUser.username,
        new_username: "",
      }));
    } catch (err) {
      setUsernameError(
        err instanceof ApiError ? err.message : "Failed to update username.",
      );
    } finally {
      setIsUpdatingUsername(false);
    }
  }

  async function handlePasswordSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPasswordError("");
    setPasswordSuccess("");

    if (passwordForm.new_password !== passwordForm.confirm_password) {
      setPasswordError("New password and confirm password do not match.");
      return;
    }

    setIsUpdatingPassword(true);

    try {
      const response = await updatePassword(passwordForm);
      setPasswordSuccess(response.message);
      setPasswordForm({
        current_password: "",
        new_password: "",
        confirm_password: "",
      });
    } catch (err) {
      setPasswordError(
        err instanceof ApiError ? err.message : "Failed to update password.",
      );
    } finally {
      setIsUpdatingPassword(false);
    }
  }

  async function handleDeleteSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setDeleteError("");
    setIsDeleting(true);

    try {
      await deleteAccount(deleteForm);
      logout();
      router.push("/");
    } catch (err) {
      setDeleteError(
        err instanceof ApiError ? err.message : "Failed to delete account.",
      );
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Profile</h2>
        <dl className="mt-4 space-y-3 text-sm">
          <div>
            <dt className="text-slate-500">Name</dt>
            <dd className="font-medium text-slate-900">
              {user.first_name} {user.last_name}
            </dd>
          </div>
          <div>
            <dt className="text-slate-500">Email</dt>
            <dd className="font-medium text-slate-900">{user.email}</dd>
          </div>
          <div>
            <dt className="text-slate-500">Username</dt>
            <dd className="font-medium text-slate-900">{user.username}</dd>
          </div>
        </dl>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Change username</h2>
        <form onSubmit={handleUsernameSubmit} className="mt-4 space-y-4">
          {usernameError ? (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {usernameError}
            </div>
          ) : null}
          {usernameSuccess ? (
            <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
              {usernameSuccess}
            </div>
          ) : null}
          <Input
            label="Current username"
            name="current_username"
            value={usernameForm.current_username}
            onChange={(event) =>
              setUsernameForm((current) => ({
                ...current,
                current_username: event.target.value,
              }))
            }
            required
          />
          <Input
            label="New username"
            name="new_username"
            value={usernameForm.new_username}
            onChange={(event) =>
              setUsernameForm((current) => ({
                ...current,
                new_username: event.target.value,
              }))
            }
            required
          />
          <Button type="submit" isLoading={isUpdatingUsername}>
            Update username
          </Button>
        </form>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Change password</h2>
        <form onSubmit={handlePasswordSubmit} className="mt-4 space-y-4">
          {passwordError ? (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {passwordError}
            </div>
          ) : null}
          {passwordSuccess ? (
            <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
              {passwordSuccess}
            </div>
          ) : null}
          <Input
            label="Current password"
            name="current_password"
            type="password"
            value={passwordForm.current_password}
            onChange={(event) =>
              setPasswordForm((current) => ({
                ...current,
                current_password: event.target.value,
              }))
            }
            required
          />
          <Input
            label="New password"
            name="new_password"
            type="password"
            minLength={8}
            value={passwordForm.new_password}
            onChange={(event) =>
              setPasswordForm((current) => ({
                ...current,
                new_password: event.target.value,
              }))
            }
            required
          />
          <Input
            label="Confirm new password"
            name="confirm_password"
            type="password"
            minLength={8}
            value={passwordForm.confirm_password}
            onChange={(event) =>
              setPasswordForm((current) => ({
                ...current,
                confirm_password: event.target.value,
              }))
            }
            required
          />
          <Button type="submit" isLoading={isUpdatingPassword}>
            Update password
          </Button>
        </form>
      </section>

      <section className="rounded-2xl border border-red-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-red-700">Delete account</h2>
        <p className="mt-2 text-sm text-slate-600">
          This permanently removes your account and all associated data.
        </p>
        <form onSubmit={handleDeleteSubmit} className="mt-4 space-y-4">
          {deleteError ? (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {deleteError}
            </div>
          ) : null}
          <Input
            label="Email or username"
            name="identifier"
            value={deleteForm.identifier}
            onChange={(event) =>
              setDeleteForm((current) => ({
                ...current,
                identifier: event.target.value,
              }))
            }
            required
          />
          <Input
            label="Password"
            name="password"
            type="password"
            value={deleteForm.password}
            onChange={(event) =>
              setDeleteForm((current) => ({
                ...current,
                password: event.target.value,
              }))
            }
            required
          />
          <Button
            type="submit"
            variant="secondary"
            className="border-red-300 text-red-700 hover:bg-red-50"
            isLoading={isDeleting}
          >
            Delete my account
          </Button>
        </form>
      </section>
    </div>
  );
}
