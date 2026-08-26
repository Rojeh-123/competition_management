import { Head, router, usePage } from "@inertiajs/react";
import { useState } from "react";
import { route } from "ziggy-js";
import { Navbar, Footer, PageHeader } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Globe, Eye, EyeOff, Trophy, Users, FolderTree, Megaphone } from "lucide-react";

function AdminProfilePage() {
  type PageProps = {
    auth: {
      user: {
        id: number;
        name: string;
        email: string;
        role: string;
      } | null;
    };

    shownAdmin: {
      id: number;
      username: string;
      full_name: string;
      email: string;
      role: string;
      country: string;
      image: string | null;
      bio: string | null;

      competitions_created: number;
      users_managed: number;
      categories_managed: number;
      announcements_created: number;

      created_competitions: {
        id: number;
        title: string;
        status: string;

        category: {
          id: number;
          name: string;
        };
      }[];
    };

    errors: Record<string, string>;
  };

  const { shownAdmin, auth, errors } = usePage<PageProps>().props;

  const [openDelete, setOpenDelete] = useState(false);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleDelete = () => {
    router.delete(route("profile.delete"), {
      data: { password },

      onSuccess: () => {
        setPassword("");
        setOpenDelete(false);
      },

      onError: () => {
        setOpenDelete(true);
      },
    });
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Head title="Profile – Administrator Details" />
      <Navbar />

      <main className="flex-1 min-w-0">
        <div className="p-4 sm:p-6 lg:p-8 min-w-0">
          <PageHeader
            title="Administrator Profile"
            description="Administrator information and management activity."
            actions={
              auth.user?.id === shownAdmin.id ? (
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.visit(route("edit-profile"))}
                  >
                    Edit Profile
                  </Button>

                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => setOpenDelete(true)}
                  >
                    Delete Profile
                  </Button>
                </div>
              ) : null
            }
          />

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">

            {/* Left Column */}

            <Card className="lg:col-span-1">
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center">
                  <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full bg-primary text-3xl font-bold text-primary-foreground">
                    {shownAdmin.image ? (
                      <img
                        src={`/competition_management/public/storage/${shownAdmin.image}`}
                        alt={shownAdmin.full_name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      shownAdmin.full_name.charAt(0).toUpperCase()
                    )}
                  </div>

                  <h2 className="mt-4 text-xl font-semibold">
                    {shownAdmin.full_name}
                  </h2>

                  <Badge className="mt-2 capitalize">
                    {shownAdmin.role}
                  </Badge>

                  <p className="mt-3 text-sm text-muted-foreground">
                    {shownAdmin.bio || "No biography provided."}
                  </p>

                  <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
                    <Globe className="h-4 w-4" />
                    {shownAdmin.country || "Not specified"}
                  </div>
                </div>

                {/* Personal Information */}

                <div className="mt-6 grid grid-cols-2 gap-4 border-t pt-6">

                  <div>
                    <p className="text-xs text-muted-foreground">
                      Full Name
                    </p>

                    <p className="font-medium">
                      {shownAdmin.full_name}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-muted-foreground">
                      Username
                    </p>

                    <p className="font-medium">
                      @{shownAdmin.username}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-muted-foreground">
                      Email
                    </p>

                    <p className="break-all font-medium">
                      {shownAdmin.email}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-muted-foreground">
                      Role
                    </p>

                    <p className="font-medium capitalize">
                      {shownAdmin.role}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-muted-foreground">
                      Country
                    </p>

                    <p className="font-medium">
                      {shownAdmin.country || "Not specified"}
                    </p>
                  </div>

                  {auth.user?.role === "admin" && (
                    <div>
                      <p className="text-xs text-muted-foreground">
                        Admin ID
                      </p>

                      <p className="font-medium">
                        #{shownAdmin.id}
                      </p>
                    </div>
                  )}

                  <div className="col-span-2">
                    <p className="text-xs text-muted-foreground">
                      Biography
                    </p>

                    <p className="font-medium">
                      {shownAdmin.bio || "No biography provided."}
                    </p>
                  </div>
                </div>

                {/* Statistics */}

                <div className="mt-6 grid grid-cols-2 gap-4 border-t pt-6">

                  <div className="rounded-lg border p-4 text-center">
                    <Trophy className="mx-auto mb-2 h-5 w-5 text-primary" />

                    <p className="text-2xl font-bold">
                      {shownAdmin.competitions_created}
                    </p>

                    <p className="text-sm text-muted-foreground">
                      Competitions
                    </p>
                  </div>

                  <div className="rounded-lg border p-4 text-center">
                    <Users className="mx-auto mb-2 h-5 w-5 text-primary" />

                    <p className="text-2xl font-bold">
                      {shownAdmin.users_managed}
                    </p>

                    <p className="text-sm text-muted-foreground">
                      Users
                    </p>
                  </div>

                  <div className="rounded-lg border p-4 text-center">
                    <FolderTree className="mx-auto mb-2 h-5 w-5 text-primary" />

                    <p className="text-2xl font-bold">
                      {shownAdmin.categories_managed}
                    </p>

                    <p className="text-sm text-muted-foreground">
                      Categories
                    </p>
                  </div>

                  <div className="rounded-lg border p-4 text-center">
                    <Megaphone className="mx-auto mb-2 h-5 w-5 text-primary" />

                    <p className="text-2xl font-bold">
                      {shownAdmin.announcements_created}
                    </p>

                    <p className="text-sm text-muted-foreground">
                      Announcements
                    </p>
                  </div>

                </div>

              </CardContent>
            </Card>

            {/* Right Column */}

            <div className="space-y-6 lg:col-span-2">

              {/* Created Competitions */}

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Trophy className="h-5 w-5" />
                    Created Competitions
                  </CardTitle>
                </CardHeader>

                <CardContent>
                  <ScrollArea className="h-185 pr-4">
                    <div className="space-y-3">
                      {shownAdmin.created_competitions.length > 0 ? (
                        shownAdmin.created_competitions.map((competition) => (
                          <div
                            key={competition.id}
                            className="flex items-start justify-between rounded-lg border p-4"
                          >
                            <div>
                              <p className="font-semibold">
                                {competition.title}
                              </p>

                              <p className="text-sm text-muted-foreground">
                                {competition.category.name}
                              </p>
                            </div>

                            <Badge className="capitalize">
                              {competition.status.replace("_", " ")}
                            </Badge>
                          </div>
                        ))
                      ) : (
                        <p className="py-8 text-center text-sm text-muted-foreground">
                          No competitions have been created yet.
                        </p>
                      )}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>

            </div>
          </div>
        </div>
      </main>

      <Footer />

      {/* Delete Profile Dialog */}

      <Dialog open={openDelete} onOpenChange={setOpenDelete}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Profile</DialogTitle>
          </DialogHeader>

          <p className="text-sm text-muted-foreground">
            Please enter your password to confirm deleting your profile.
            This action cannot be undone.
          </p>

          <div className="relative mt-2">
            <Input
              type={showPassword ? "text" : "password"}
              value={password}
              placeholder="Enter your password"
              className="pr-10"
              onChange={(e) => setPassword(e.target.value)}
            />

            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            >
              {showPassword ? (
                <EyeOff size={18} />
              ) : (
                <Eye size={18} />
              )}
            </button>
          </div>

          {errors.password && (
            <p className="text-sm font-medium text-destructive">
              {errors.password}
            </p>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setOpenDelete(false)}
            >
              Cancel
            </Button>

            <Button
              variant="destructive"
              disabled={password.trim().length < 8}
              onClick={handleDelete}
            >
              Yes, Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default AdminProfilePage;