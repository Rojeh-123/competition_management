import { useEffect, useRef, useState } from 'react';
import { route } from "ziggy-js";
import { Head, usePage, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  PageHeader,
  Navbar,
  Footer,
  DashboardSidebar,
  SearchBar,
} from '@/components/layout';

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { COUNTRIES } from '@/lib/countries';
import { Check, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';

type User = {
  id: number;
  image: string;
  full_name: string;
  username: string;
  email: string;
  role: string;
  country: string;
  account_status: string;
  age: number;
  bio: string;
};

type PageProps = {
  judges: User[];
};

function CountryCombobox({
  id,
  value,
  onChange,
}: {
  id?: string;
  value: string;
  onChange: (value: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (open) {
      setQuery("");
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [open]);

  const filtered = COUNTRIES.filter((country) =>
    country.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="relative" ref={containerRef}>
      <Button
        id={id}
        type="button"
        variant="outline"
        role="combobox"
        aria-expanded={open}
        className="w-full justify-between font-normal"
        onClick={() => setOpen((o) => !o)}
      >
        {value || "Select a country"}
        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
      </Button>

      {open && (
        <div className="absolute z-50 mt-1 w-full rounded-md border bg-popover text-popover-foreground shadow-md">
          <div className="border-b p-1.5">
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search country..."
              className="w-full bg-transparent px-2 py-1 text-sm outline-none placeholder:text-muted-foreground"
            />
          </div>
          <div className="max-h-60 overflow-y-auto p-1">
            {filtered.length === 0 && (
              <p className="px-2 py-1.5 text-sm text-muted-foreground">
                No country found.
              </p>
            )}
            {filtered.map((country) => (
              <button
                key={country}
                type="button"
                className="flex w-full items-center rounded-sm px-2 py-1.5 text-left text-sm hover:bg-accent hover:text-accent-foreground"
                onClick={() => {
                  onChange(country === value ? "" : country);
                  setOpen(false);
                }}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4 shrink-0",
                    value === country ? "opacity-100" : "opacity-0"
                  )}
                />
                {country}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ManageJudgesPage() {
  const [search, setSearch] = useState('');
  const { judges, errors } = usePage<PageProps>().props;

  const filtered = judges.filter(
    (u) =>
      u.full_name.toLowerCase().includes(search.toLowerCase()) ||
      u.username.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.role.toLowerCase().includes(search.toLowerCase())
  );

  const [showModifyDialog, setShowModifyDialog] = useState(false);
  const [selectedJudge, setSelectedJudge] = useState<User | null>(null);

  const [form, setForm] = useState<User | null>(null);

  const [showAddDialog, setShowAddDialog] = useState(false);

  const emptyJudge = {
    id: 0,
    image: "",
    full_name: "",
    username: "",
    email: "",
    role: "participant",
    country: "",
    account_status: "active",
    age: 0,
    bio: "",
  };

  const [newJudge, setnewJudge] = useState<User>(emptyJudge);
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");

  const saveJudge = () => {
    if (!form) return;

    router.put(
      route("admin.judges.update", form.id),
      {
        full_name: form.full_name,
        username: form.username,
        email: form.email,
        country: form.country,
        age: form.age,
        bio: form.bio,
        role: form.role,
        account_status: form.account_status,
      },
      {
        preserveScroll: true,
        onSuccess: () => {
          setShowModifyDialog(false);
        },
      }
    );
  };

  const deleteJudge = () => {
    if (!selectedJudge) return;

    if (!confirm("Are you sure you want to delete this judge?")) {
      return;
    }

    router.delete(
      route("admin.judges.destroy", selectedJudge.id),
      {
        preserveScroll: true,
        onSuccess: () => {
          setShowModifyDialog(false);
        },
      }
    );
  };

  const createJudge = () => {
    router.post(
      route("admin.judges.store"),
      {
        full_name: newJudge.full_name,
        username: newJudge.username,
        email: newJudge.email,
        password,
        password_confirmation: passwordConfirmation,
        country: newJudge.country,
        age: newJudge.age,
        bio: newJudge.bio,
        role: "judge",
        account_status: newJudge.account_status,
      },
      {
        preserveScroll: true,
        onSuccess: () => {
          setShowAddDialog(false);
          setnewJudge(emptyJudge);
          setPassword("");
          setPasswordConfirmation("");
        },
      }
    );
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Head title="Manage Judges – Judge Administration" />
      <Navbar />
      <div className="flex flex-col lg:flex-row flex-1 min-w-0">
        <DashboardSidebar />
        <main className="flex-1 overflow-auto min-w-0">
          <div className="p-4 sm:p-6 lg:p-8 min-w-0">
            <PageHeader title="Manage Judges" description="Judge directory and assignment management" />

            <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="max-w-md w-full">
                <SearchBar
                  value={search}
                  onChange={setSearch}
                  placeholder="Search judges by name, username, email, or role..."
                />
              </div>

              <Button
                onClick={() => setShowAddDialog(true)}
                className="w-full sm:w-auto"
              >
                Add Judge
              </Button>
            </div>

            <div className="border rounded-lg overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted">
                  <tr>
                    <th className="text-left px-4 py-3 font-medium">Judge</th>
                    <th className="text-left px-4 py-3 font-medium hidden sm:table-cell">Specialty</th>
                    <th className="text-left px-4 py-3 font-medium">Status</th>
                    <th className="text-left px-4 py-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((judge) => {
                    const badgeClass =
                      judge.account_status === "active"
                        ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 border-0 text-xs"
                        : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300 border-0 text-xs";

                    return (
                      <tr key={judge.id} className="border-t hover:bg-muted/50" onClick={() => router.visit(route("admin.users.show", judge.id))}>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium shrink-0">
                              {judge.full_name.charAt(0)}
                            </div>

                            <div className="min-w-0">
                              <p className="font-medium truncate">{judge.full_name}</p>
                              <p className="text-xs text-muted-foreground truncate">{judge.email}</p>
                            </div>
                          </div>
                        </td>

                        <td className="px-4 py-3 hidden sm:table-cell text-muted-foreground">
                          {judge.bio?.split(" ").slice(0, 3).join(" ")}
                        </td>

                        <td className="px-4 py-3 whitespace-nowrap">
                          <Badge variant="destructive" className={badgeClass}>
                            {judge.account_status}
                          </Badge>
                        </td>
                        {judge.account_status === "active" ? (
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  router.visit(route("admin.judges.assign", judge.id));
                                }}
                              >
                                Assign
                              </Button>
                              <Button
                                size="sm"
                                variant="default"
                                className="cursor-pointer"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedJudge(judge);
                                  setForm({ ...judge });
                                  setShowModifyDialog(true);
                                }}
                              >
                                Modify
                              </Button>
                            </div>
                          </td>
                        ) : (
                          <td className="px-4 py-3 text-xs text-muted-foreground">
                            Disabled account
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>

      <Dialog open={showModifyDialog} onOpenChange={setShowModifyDialog}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          {selectedJudge && (
            <>
              <DialogHeader className="pb-4 border-b">
                <div className="flex items-center gap-4">
                  <div className="h-14 w-14 rounded-full overflow-hidden bg-primary/10 flex items-center justify-center text-lg font-semibold">
                    {selectedJudge.image ? (
                      <img
                        src={`/competition_management/public/storage/${selectedJudge.image}`}
                        alt={selectedJudge.full_name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      selectedJudge.full_name.charAt(0).toUpperCase()
                    )}
                  </div>

                  <div>
                    <DialogTitle className="text-xl">
                      Modify Judge
                    </DialogTitle>

                    <p className="text-sm text-muted-foreground">
                      Edit account information and permissions.
                    </p>
                  </div>
                </div>
              </DialogHeader>

              <div className="space-y-8 py-6">

                {/* Personal Information */}
                <section className="space-y-4">
                  <h3 className="text-sm font-semibold tracking-wide text-muted-foreground uppercase">
                    Personal Information
                  </h3>

                  <div className="grid gap-4 md:grid-cols-2">

                    <div className="space-y-2">
                      <Label htmlFor="full_name">Full Name</Label>
                      <Input
                        id="full_name"
                        value={form?.full_name ?? ""}
                        onChange={(e) =>
                          setForm(prev => prev && {
                            ...prev,
                            full_name: e.target.value
                          })
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="username">Username</Label>
                      <Input
                        id="username"
                        value={form?.username ?? ""}
                        onChange={(e) =>
                          setForm(prev => prev && {
                            ...prev,
                            username: e.target.value
                          })
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={form?.email ?? ""}
                        onChange={(e) =>
                          setForm(prev => prev && {
                            ...prev,
                            email: e.target.value
                          })
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="country">Country</Label>
                      <CountryCombobox
                        id="country"
                        value={form?.country ?? ""}
                        onChange={(value) =>
                          setForm(prev => prev && {
                            ...prev,
                            country: value,
                          })
                        }
                      />
                    </div>

                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="age">Age</Label>
                    <Input
                      id="age"
                      type="number"
                      value={form?.age ?? ""}
                      onChange={(e) =>
                        setForm(prev => prev && {
                          ...prev,
                          age: Number(e.target.value)
                        })
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bio">Bio</Label>
                    <textarea
                      id="bio"
                      placeholder="Tell us something about yourself..."
                      className="mt-1 flex min-h-24 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      value={form?.bio ?? ""}
                      onChange={(e) =>
                        setForm(prev => prev && {
                          ...prev,
                          bio: e.target.value
                        })
                      }
                    />
                  </div>
                </section>

                <div className="border-t" />

                {/* Account */}
                <section className="space-y-4">
                  <h3 className="text-sm font-semibold tracking-wide text-muted-foreground uppercase">
                    Account
                  </h3>

                  <div className="grid gap-4 md:grid-cols-2">

                    <div className="space-y-2">
                      <Label>Role</Label>

                      <Select
                        value={form?.role}
                        onValueChange={(value) =>
                          setForm(prev => prev && {
                            ...prev,
                            role: value
                          })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>

                        <SelectContent>
                          <SelectItem value="participant">
                            Participant
                          </SelectItem>

                          <SelectItem value="judge">
                            Judge
                          </SelectItem>

                          <SelectItem value="admin">
                            Admin
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Status</Label>

                      <Select
                        value={form?.account_status ?? ""}
                        onValueChange={(value) =>
                          setForm(prev =>
                            prev
                              ? {
                                ...prev,
                                account_status: value,
                              }
                              : null
                          )
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>

                        <SelectContent>
                          <SelectItem value="active">
                            Active
                          </SelectItem>

                          <SelectItem value="disabled">
                            Disabled
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                  </div>
                </section>

                <div className="border-t" />

                {/* Danger Zone */}
                <section className="rounded-lg border border-destructive/20 bg-destructive/5 p-4">
                  <h3 className="font-semibold text-destructive">
                    Danger Zone
                  </h3>

                  <p className="mt-1 text-sm text-muted-foreground">
                    Permanently remove this judge and all associated data.
                  </p>

                  <Button
                    variant="destructive"
                    className="mt-4"
                    type="button"
                    onClick={deleteJudge}
                  >
                    Delete Judge
                  </Button>
                </section>

              </div>

              <DialogFooter className="border-t pt-4">
                <Button
                  variant="outline"
                  onClick={() => setShowModifyDialog(false)}
                >
                  Cancel
                </Button>

                <Button onClick={saveJudge}>
                  Save Changes
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader className="pb-4 border-b">
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center text-lg font-semibold">
                {newJudge.full_name
                  ? newJudge.full_name.charAt(0).toUpperCase()
                  : "+"}
              </div>

              <div>
                <DialogTitle className="text-xl">
                  Add Judge
                </DialogTitle>

                <p className="text-sm text-muted-foreground">
                  Create a new Judge account.
                </p>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-8 py-6">

            {/* Personal Information */}
            <section className="space-y-4">
              <h3 className="text-sm font-semibold tracking-wide uppercase text-muted-foreground">
                Personal Information
              </h3>

              <div className="grid gap-4 md:grid-cols-2">

                <div className="space-y-2">
                  <Label>Full Name</Label>
                  <Input
                    value={newJudge.full_name}
                    onChange={(e) =>
                      setnewJudge({
                        ...newJudge,
                        full_name: e.target.value,
                      })
                    }
                  />
                  {errors.full_name && (
                    <p className="text-sm font-semibold text-destructive">
                      {errors.full_name}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Username</Label>
                  <Input
                    value={newJudge.username}
                    onChange={(e) =>
                      setnewJudge({
                        ...newJudge,
                        username: e.target.value,
                      })
                    }
                  />
                  {errors.username && (
                    <p className="text-sm font-semibold text-destructive">
                      {errors.username}
                    </p>
                  )}

                </div>

                <div className="space-y-2">
                  <Label>Age</Label>
                  <Input
                    type="number"
                    value={newJudge.age}
                    onChange={(e) =>
                      setnewJudge({
                        ...newJudge,
                        age: Number(e.target.value),
                      })
                    }
                  />
                  {errors.age && (
                    <p className="text-sm font-semibold text-destructive">
                      {errors.age}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Country</Label>
                  <CountryCombobox
                    value={newJudge.country}
                    onChange={(value) =>
                      setnewJudge({
                        ...newJudge,
                        country: value,
                      })
                    }
                  />
                  {errors.country && (
                    <p className="text-sm font-semibold text-destructive">
                      {errors.country}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Email</Label>
                <Input
                  type="email"
                  value={newJudge.email}
                  onChange={(e) =>
                    setnewJudge({
                      ...newJudge,
                      email: e.target.value,
                    })
                  }
                />
                {errors.email && (
                  <p className="text-sm font-semibold text-destructive">
                    {errors.email}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Bio</Label>

                <textarea
                  className="flex min-h-24 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  placeholder="Tell us something about this Judge..."
                  value={newJudge.bio}
                  onChange={(e) =>
                    setnewJudge({
                      ...newJudge,
                      bio: e.target.value,
                    })
                  }
                />
                {errors.bio && (
                  <p className="text-sm font-semibold text-destructive">
                    {errors.bio}
                  </p>
                )}
              </div>
            </section>

            <div className="border-t" />

            {/* Account Settings */}
            <section className="space-y-4">
              <h3 className="text-sm font-semibold tracking-wide uppercase text-muted-foreground">
                Account Settings
              </h3>

              <div className="space-y-2">
                <Label>Status</Label>

                <Select
                  value={newJudge.account_status}
                  onValueChange={(value) =>
                    setnewJudge({
                      ...newJudge,
                      account_status: value,
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>

                  <SelectContent>
                    <SelectItem value="active">
                      Active
                    </SelectItem>

                    <SelectItem value="disabled">
                      Disabled
                    </SelectItem>
                  </SelectContent>
                </Select>
                {errors.account_status && (
                  <p className="text-sm font-semibold text-destructive">
                    {errors.account_status}
                  </p>
                )}
              </div>

              <div className="grid gap-4 md:grid-cols-2">

                <div className="space-y-2">
                  <Label>Password</Label>
                  <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  {errors.password && (
                    <p className="text-sm font-semibold text-destructive">
                      {errors.password}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Confirm Password</Label>
                  <Input
                    type="password"
                    value={passwordConfirmation}
                    onChange={(e) =>
                      setPasswordConfirmation(e.target.value)
                    }
                  />
                  {errors.password_confirmation && (
                    <p className="text-sm font-semibold text-destructive">
                      {errors.password_confirmation}
                    </p>
                  )}
                </div>

              </div>
            </section>

          </div>

          <DialogFooter className="border-t pt-4">
            <Button
              variant="outline"
              onClick={() => setShowAddDialog(false)}
            >
              Cancel
            </Button>

            <Button onClick={createJudge}>
              Create Judge
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
}

export default ManageJudgesPage;