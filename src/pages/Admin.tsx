import MobileShell from "@/components/MobileShell";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { ArrowLeft, Trash2, Pencil, Shield, Users, Search, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface AdminUser {
  id: string;
  email: string;
  created_at: string;
  last_sign_in_at: string | null;
  display_name: string | null;
  role: string;
}

const Admin = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [checkingAdmin, setCheckingAdmin] = useState(true);
  const [search, setSearch] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<AdminUser | null>(null);
  const [editTarget, setEditTarget] = useState<AdminUser | null>(null);
  const [editName, setEditName] = useState("");
  const [editRole, setEditRole] = useState("");
  const [saving, setSaving] = useState(false);

  const checkAdmin = useCallback(async () => {
    if (!user) { setCheckingAdmin(false); return; }
    const { data } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .maybeSingle();
    if (!data) {
      navigate("/");
      toast.error("Unauthorized: Admin access required");
      setCheckingAdmin(false);
      return;
    }
    setIsAdmin(true);
    setCheckingAdmin(false);
  }, [user, navigate]);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase.rpc("admin_list_users");
    if (error) {
      toast.error("Failed to load users");
      console.error(error);
    } else {
      setUsers((data as AdminUser[]) || []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    checkAdmin().then(() => fetchUsers());
  }, [checkAdmin, fetchUsers]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setSaving(true);
    const { error } = await supabase.rpc("admin_delete_user", {
      target_user_id: deleteTarget.id,
    });
    if (error) {
      toast.error(error.message || "Failed to delete user");
    } else {
      toast.success(`Deleted ${deleteTarget.email}`);
      setUsers((prev) => prev.filter((u) => u.id !== deleteTarget.id));
    }
    setDeleteTarget(null);
    setSaving(false);
  };

  const handleEdit = async () => {
    if (!editTarget) return;
    setSaving(true);
    const { error } = await supabase.rpc("admin_update_user", {
      target_user_id: editTarget.id,
      new_display_name: editName || null,
      new_role: (editRole || null) as "admin" | "moderator" | "user" | null,
    });
    if (error) {
      toast.error(error.message || "Failed to update user");
    } else {
      toast.success(`Updated ${editTarget.email}`);
      fetchUsers();
    }
    setEditTarget(null);
    setSaving(false);
  };

  const openEdit = (u: AdminUser) => {
    setEditTarget(u);
    setEditName(u.display_name || "");
    setEditRole(u.role);
  };

  const filtered = users.filter(
    (u) =>
      (u.email || "").toLowerCase().includes(search.toLowerCase()) ||
      (u.display_name || "").toLowerCase().includes(search.toLowerCase())
  );

  if (checkingAdmin || !isAdmin) {
    return (
      <MobileShell>
        <div className="flex items-center justify-center h-full min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </MobileShell>
    );
  }

  return (
    <MobileShell>
      <div className="px-5 pt-6 pb-4">
        <div className="flex items-center gap-3 mb-5">
          <button
            onClick={() => navigate("/")}
            className="p-2 rounded-xl bg-secondary active:scale-95 transition-transform"
          >
            <ArrowLeft size={18} className="text-foreground" />
          </button>
          <div className="flex items-center gap-2">
            <Shield size={20} className="text-primary" />
            <h1 className="font-display text-xl font-bold text-foreground">
              Admin Dashboard
            </h1>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          <div className="bg-card border border-border rounded-xl p-3 text-center">
            <p className="text-lg font-bold text-foreground">{users.length}</p>
            <p className="text-[10px] text-muted-foreground">Total Users</p>
          </div>
          <div className="bg-card border border-border rounded-xl p-3 text-center">
            <p className="text-lg font-bold text-foreground">
              {users.filter((u) => u.role === "admin").length}
            </p>
            <p className="text-[10px] text-muted-foreground">Admins</p>
          </div>
          <div className="bg-card border border-border rounded-xl p-3 text-center">
            <p className="text-lg font-bold text-foreground">
              {users.filter((u) => {
                if (!u.last_sign_in_at) return false;
                const diff = Date.now() - new Date(u.last_sign_in_at).getTime();
                return diff < 7 * 24 * 60 * 60 * 1000;
              }).length}
            </p>
            <p className="text-[10px] text-muted-foreground">Active (7d)</p>
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            placeholder="Search users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-secondary border-border"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2"
            >
              <X size={14} className="text-muted-foreground" />
            </button>
          )}
        </div>

        {/* User List */}
        <div className="space-y-2">
          {loading ? (
            <div className="text-center py-8 text-muted-foreground text-sm">
              Loading users...
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-sm">
              No users found
            </div>
          ) : (
            filtered.map((u) => (
              <div
                key={u.id}
                className="bg-card border border-border rounded-xl p-3.5 flex items-center justify-between gap-2"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-foreground truncate">
                      {u.display_name || "No name"}
                    </p>
                    <Badge
                      variant={u.role === "admin" ? "default" : "secondary"}
                      className="text-[9px] px-1.5 py-0"
                    >
                      {u.role}
                    </Badge>
                  </div>
                  <p className="text-[11px] text-muted-foreground truncate">
                    {u.email}
                  </p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    Joined{" "}
                    {new Date(u.created_at).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                    {u.last_sign_in_at &&
                      ` · Last seen ${new Date(u.last_sign_in_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}`}
                  </p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8"
                    onClick={() => openEdit(u)}
                  >
                    <Pencil size={14} />
                  </Button>
                  {u.id !== user?.id && (
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() => setDeleteTarget(u)}
                    >
                      <Trash2 size={14} />
                    </Button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Delete Confirmation */}
      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete User</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete{" "}
              <strong>{deleteTarget?.email}</strong> and all their data. This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={saving}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {saving ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edit Dialog */}
      <Dialog
        open={!!editTarget}
        onOpenChange={(open) => !open && setEditTarget(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <p className="text-sm text-muted-foreground">{editTarget?.email}</p>
            <div className="space-y-2">
              <Label>Display Name</Label>
              <Input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="Display name"
              />
            </div>
            <div className="space-y-2">
              <Label>Role</Label>
              <Select value={editRole} onValueChange={setEditRole}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="moderator">Moderator</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEditTarget(null)}
            >
              Cancel
            </Button>
            <Button onClick={handleEdit} disabled={saving}>
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </MobileShell>
  );
};

export default Admin;
