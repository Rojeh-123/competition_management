import { Head, useForm, router } from "@inertiajs/react";
import { route } from "ziggy-js";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

import {
  DashboardSidebar,
  Footer,
  Navbar,
  PageHeader,
} from "@/components/layout";

type Category = {
  id: number;
  name: string;
  description: string;
};

type Competition = CompetitionForm & {
  id: number;
  image: string | null;
};

type Props = {
  categories: Category[];
  competition?: Competition;
};

type CompetitionForm = {
  title: string;
  image: File | null;
  category_id: string;
  description: string;
  rules: string;

  start_date: string;
  registration_deadline: string;
  submission_deadline: string;
  judging_start_date: string;
  judging_end_date: string;
  end_date: string;
  published_at: string;
  winner_announced_at: string;

  max_file_size_mb: string;
  allowed_file_types: string;
  number_of_winners: number;
  prize_description: string;

  visibility: "public" | "private";
  is_featured: boolean;
  team_allowed: boolean;
  certificate_enabled: boolean;
  requires_approval: boolean;

  min_age: string;
  max_age: string;

  contact_email: string;
  contact_phone: string;
};

function CreateAndEditCompetitionPages({ categories, competition }: Props) {
  const isEditing = !!competition;
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const formatDateTimeLocal = (value?: string | null) => {
    if (!value) return "";

    const date = new Date(value);

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");

    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const { data, setData, post, put, processing, errors } = useForm<CompetitionForm>({
    title: competition?.title ?? "",
    image: null,
    category_id: competition?.category_id?.toString() ?? "",
    description: competition?.description ?? "",
    rules: competition?.rules ?? "",

  start_date: formatDateTimeLocal(competition?.start_date),
  registration_deadline: formatDateTimeLocal(competition?.registration_deadline),
  submission_deadline: formatDateTimeLocal(competition?.submission_deadline),
  judging_start_date: formatDateTimeLocal(competition?.judging_start_date),
  judging_end_date: formatDateTimeLocal(competition?.judging_end_date),
  end_date: formatDateTimeLocal(competition?.end_date),
  published_at: formatDateTimeLocal(competition?.published_at),
  winner_announced_at: formatDateTimeLocal(competition?.winner_announced_at),

    max_file_size_mb: competition?.max_file_size_mb?.toString() ?? "",
    allowed_file_types: competition?.allowed_file_types ?? "",
    number_of_winners: competition?.number_of_winners ?? 3,
    prize_description: competition?.prize_description ?? "",

    visibility: competition?.visibility ?? "public",
    is_featured: competition?.is_featured ?? false,
    team_allowed: competition?.team_allowed ?? false,
    certificate_enabled: competition?.certificate_enabled ?? true,
    requires_approval: competition?.requires_approval ?? false,

    min_age: competition?.min_age?.toString() ?? "",
    max_age: competition?.max_age?.toString() ?? "",

    contact_email: competition?.contact_email ?? "",
    contact_phone: competition?.contact_phone ?? "",
  });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();

    if (isEditing) {
      router.post(
        route("admin.competitions.update", competition.id),
        {
          ...data,
          _method: "PUT",
        },
        {
          forceFormData: true,
        }
      );
    } else {
      post(route("admin.competitions.store"), {
        forceFormData: true,
      });
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Head title={isEditing ? "Edit Competition – Competition Management" : "Create Competition – Competition Management"} />
      <Navbar />

      <div className="flex flex-col lg:flex-row flex-1 min-w-0">
        <DashboardSidebar />

        <main className="flex-1 overflow-auto min-w-0">
          <div className="p-4 sm:p-6 lg:p-8 min-w-0">
            <PageHeader
              title={isEditing ? "Edit Competition" : "Create New Competition"}
              description={
                isEditing
                  ? "Update the competition details."
                  : "Set up a new competition for participants"
              }
            />

            <Card className="mx-auto">
              <CardContent className="pt-6">
                <form onSubmit={submit} className="space-y-6">
                  {/* Basic Information */}
                  <div className="space-y-6">

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                      <div>
                        <Label htmlFor="title">Competition Title</Label>
                        <Input
                          id="title"
                          className="mt-1.5"
                          value={data.title}
                          onChange={(e) => setData("title", e.target.value)}
                          placeholder="Interface Design Grand Prix"
                        />
                        {errors.title && (
                          <p className="mt-1 text-sm text-red-500 font-semibold">{errors.title}</p>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="category">Category</Label>

                        <Select
                          value={data.category_id}
                          onValueChange={(value) => setData("category_id", value)}
                        >
                          <SelectTrigger className="mt-1.5">
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>

                          <SelectContent>
                            {categories.map((category) => (
                              <SelectItem
                                key={category.id}
                                value={String(category.id)}
                              >
                                {category.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>

                        {errors.category_id && (
                          <p className="mt-1 text-sm text-red-500 font-semibold">
                            {errors.category_id}
                          </p>
                        )}
                      </div>

                    </div>

                    <div className="space-y-2">
                      <Label>Competition Image</Label>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                        {/* Upload */}
                        <div>
                          <Label htmlFor="image" className="text-sm text-muted-foreground">
                            Replace Image
                          </Label>

                          <Input
                            id="image"
                            type="file"
                            accept="image/*"
                            className="mt-2"
                            onChange={(e) => {
                              const file = e.target.files?.[0] ?? null;

                              setData("image", file);

                              if (file) {
                                setImagePreview(URL.createObjectURL(file));
                              } else {
                                setImagePreview(null);
                              }
                            }}
                          />

                          <p className="mt-2 text-xs text-muted-foreground">
                            Leave this empty to keep the current image.
                          </p>

                          {errors.image && (
                            <p className="mt-2 text-sm font-semibold text-red-500">
                              {errors.image}
                            </p>
                          )}
                        </div>
                        
                        {/* Current Image */}
                        <div>
                          <Label className="text-sm text-muted-foreground">
                            {imagePreview ? "New Image Preview" : "Current Image"}
                          </Label>

                          {imagePreview ? (
                            <img
                              src={imagePreview}
                              alt="New preview"
                              className="mt-2 h-56 w-full rounded-lg border object-cover"
                            />
                          ) : isEditing && competition.image ? (
                            <img
                              src={`/competition_management/public/storage/${competition.image}`}
                              alt={competition.title}
                              className="mt-2 h-56 w-full rounded-lg border object-cover"
                            />
                          ) : (
                            <div className="mt-2 flex h-56 items-center justify-center rounded-lg border border-dashed text-sm text-muted-foreground">
                              No image uploaded
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div>

                      <div>
                        <Label htmlFor="visibility">Visibility</Label>

                        <Select
                          value={data.visibility}
                          onValueChange={(value) =>
                            setData("visibility", value as "public" | "private")
                          }
                        >
                          <SelectTrigger className="mt-1.5">
                            <SelectValue />
                          </SelectTrigger>

                          <SelectContent>
                            <SelectItem value="public">Public</SelectItem>
                            <SelectItem value="private">Private</SelectItem>
                          </SelectContent>
                        </Select>

                        {errors.visibility && (
                          <p className="mt-1 text-sm text-red-500 font-semibold">
                            {errors.visibility}
                          </p>
                        )}
                      </div>

                    </div>

                  </div>

                  {/* Description & Rules */}
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        className="mt-1.5 min-h-[120px]"
                        value={data.description}
                        onChange={(e) => setData("description", e.target.value)}
                      />
                      {errors.description && (
                        <p className="mt-1 text-sm text-red-500 font-semibold">
                          {errors.description}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="rules">Rules</Label>
                      <Textarea
                        id="rules"
                        className="mt-1.5 min-h-[120px]"
                        value={data.rules}
                        onChange={(e) => setData("rules", e.target.value)}
                      />
                      {errors.rules && (
                        <p className="mt-1 text-sm text-red-500 font-semibold">
                          {errors.rules}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Competition Dates */}
                  <div className="space-y-6">

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                      <div>
                        <Label htmlFor="published_at">Published At</Label>
                        <Input
                          id="published_at"
                          type="datetime-local"
                          className="mt-1.5"
                          value={data.published_at}
                          onChange={(e) => setData("published_at", e.target.value)}
                        />
                        {errors.published_at && (
                          <p className="mt-1 text-sm text-red-500 font-semibold">
                            {errors.published_at}
                          </p>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="registration_deadline">
                          Registration Deadline
                        </Label>
                        <Input
                          id="registration_deadline"
                          type="datetime-local"
                          className="mt-1.5"
                          value={data.registration_deadline}
                          onChange={(e) =>
                            setData("registration_deadline", e.target.value)
                          }
                        />
                        {errors.registration_deadline && (
                          <p className="mt-1 text-sm text-red-500 font-semibold">
                            {errors.registration_deadline}
                          </p>
                        )}
                      </div>

                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                      <div>
                        <Label htmlFor="start_date">Start Date</Label>
                        <Input
                          id="start_date"
                          type="datetime-local"
                          className="mt-1.5"
                          value={data.start_date}
                          onChange={(e) => setData("start_date", e.target.value)}
                        />
                        {errors.start_date && (
                          <p className="mt-1 text-sm text-red-500 font-semibold">
                            {errors.start_date}
                          </p>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="submission_deadline">
                          Submission Deadline
                        </Label>
                        <Input
                          id="submission_deadline"
                          type="datetime-local"
                          className="mt-1.5"
                          value={data.submission_deadline}
                          onChange={(e) =>
                            setData("submission_deadline", e.target.value)
                          }
                        />
                        {errors.submission_deadline && (
                          <p className="mt-1 text-sm text-red-500 font-semibold">
                            {errors.submission_deadline}
                          </p>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="end_date">End Date</Label>
                        <Input
                          id="end_date"
                          type="datetime-local"
                          className="mt-1.5"
                          value={data.end_date}
                          onChange={(e) => setData("end_date", e.target.value)}
                        />
                        {errors.end_date && (
                          <p className="mt-1 text-sm text-red-500 font-semibold">
                            {errors.end_date}
                          </p>
                        )}
                      </div>

                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                      <div>
                        <Label htmlFor="judging_start_date">
                          Judging Start
                        </Label>
                        <Input
                          id="judging_start_date"
                          type="datetime-local"
                          className="mt-1.5"
                          value={data.judging_start_date}
                          onChange={(e) =>
                            setData("judging_start_date", e.target.value)
                          }
                        />
                        {errors.judging_start_date && (
                          <p className="mt-1 text-sm text-red-500 font-semibold">
                            {errors.judging_start_date}
                          </p>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="judging_end_date">
                          Judging End
                        </Label>
                        <Input
                          id="judging_end_date"
                          type="datetime-local"
                          className="mt-1.5"
                          value={data.judging_end_date}
                          onChange={(e) =>
                            setData("judging_end_date", e.target.value)
                          }
                        />
                        {errors.judging_end_date && (
                          <p className="mt-1 text-sm text-red-500 font-semibold">
                            {errors.judging_end_date}
                          </p>
                        )}
                      </div>

                    </div>

                    <div>
                      <Label htmlFor="winner_announced_at">
                        Winner Announcement Date
                      </Label>
                      <Input
                        id="winner_announced_at"
                        type="datetime-local"
                        className="mt-1.5"
                        value={data.winner_announced_at}
                        onChange={(e) =>
                          setData("winner_announced_at", e.target.value)
                        }
                      />
                      {errors.winner_announced_at && (
                        <p className="mt-1 text-sm text-red-500 font-semibold">
                          {errors.winner_announced_at}
                        </p>
                      )}
                    </div>

                  </div>

                  {/* File Settings & Prizes */}
                  <div className="space-y-6">

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                      <div>
                        <Label htmlFor="max_file_size_mb">
                          Maximum File Size (MB)
                        </Label>
                        <Input
                          id="max_file_size_mb"
                          type="number"
                          min={1}
                          className="mt-1.5"
                          value={data.max_file_size_mb}
                          onChange={(e) =>
                            setData("max_file_size_mb", e.target.value)
                          }
                        />
                        {errors.max_file_size_mb && (
                          <p className="mt-1 text-sm text-red-500 font-semibold">
                            {errors.max_file_size_mb}
                          </p>
                        )}
                      </div>

                      <div className="md:col-span-2">
                        <Label htmlFor="allowed_file_types">
                          Allowed File Types
                        </Label>
                        <Input
                          id="allowed_file_types"
                          className="mt-1.5"
                          placeholder="pdf, zip, jpg, png"
                          value={data.allowed_file_types}
                          onChange={(e) =>
                            setData("allowed_file_types", e.target.value)
                          }
                        />
                        {errors.allowed_file_types && (
                          <p className="mt-1 text-sm text-red-500 font-semibold">
                            {errors.allowed_file_types}
                          </p>
                        )}
                      </div>

                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                      <div>
                        <Label htmlFor="number_of_winners">
                          Number of Winners
                        </Label>
                        <Input
                          id="number_of_winners"
                          type="number"
                          min={1}
                          className="mt-1.5"
                          value={data.number_of_winners}
                          onChange={(e) =>
                            setData("number_of_winners", Number(e.target.value))
                          }
                        />
                        {errors.number_of_winners && (
                          <p className="mt-1 text-sm text-red-500 font-semibold">
                            {errors.number_of_winners}
                          </p>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="prize_description">
                          Prize Description
                        </Label>
                        <Input
                          id="prize_description"
                          className="mt-1.5"
                          placeholder="1st: $1000, 2nd: $500..."
                          value={data.prize_description}
                          onChange={(e) =>
                            setData("prize_description", e.target.value)
                          }
                        />
                        {errors.prize_description && (
                          <p className="mt-1 text-sm text-red-500 font-semibold">
                            {errors.prize_description}
                          </p>
                        )}
                      </div>

                    </div>

                  </div>

                  {/* Competition Options */}
                  <div className="space-y-4">

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="team_allowed"
                          checked={data.team_allowed}
                          onCheckedChange={(checked) =>
                            setData("team_allowed", !!checked)
                          }
                        />
                        <Label htmlFor="team_allowed" className="cursor-pointer">
                          Allow Team Participation
                        </Label>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="certificate_enabled"
                          checked={data.certificate_enabled}
                          onCheckedChange={(checked) =>
                            setData("certificate_enabled", !!checked)
                          }
                        />
                        <Label htmlFor="certificate_enabled" className="cursor-pointer">
                          Generate Certificates
                        </Label>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="requires_approval"
                          checked={data.requires_approval}
                          onCheckedChange={(checked) =>
                            setData("requires_approval", !!checked)
                          }
                        />
                        <Label htmlFor="requires_approval" className="cursor-pointer">
                          Require Admin Approval
                        </Label>
                      </div>

                      <div className="flex items-end">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="is_featured"
                            checked={data.is_featured}
                            onCheckedChange={(checked) =>
                              setData("is_featured", !!checked)
                            }
                          />

                          <Label
                            htmlFor="is_featured"
                            className="cursor-pointer"
                          >
                            Featured Competition
                          </Label>
                        </div>
                      </div>

                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                      <div>
                        <Label htmlFor="min_age">Minimum Age</Label>
                        <Input
                          id="min_age"
                          type="number"
                          min={0}
                          className="mt-1.5"
                          value={data.min_age}
                          onChange={(e) => setData("min_age", e.target.value)}
                        />
                        {errors.min_age && (
                          <p className="mt-1 text-sm text-red-500 font-semibold">
                            {errors.min_age}
                          </p>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="max_age">Maximum Age</Label>
                        <Input
                          id="max_age"
                          type="number"
                          min={0}
                          className="mt-1.5"
                          value={data.max_age}
                          onChange={(e) => setData("max_age", e.target.value)}
                        />
                        {errors.max_age && (
                          <p className="mt-1 text-sm text-red-500 font-semibold">
                            {errors.max_age}
                          </p>
                        )}
                      </div>

                    </div>

                  </div>

                  {/* Contact Information */}
                  <div className="space-y-6">

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                      <div>
                        <Label htmlFor="contact_email">
                          Contact Email
                        </Label>
                        <Input
                          id="contact_email"
                          type="email"
                          className="mt-1.5"
                          placeholder="competition@example.com"
                          value={data.contact_email}
                          onChange={(e) =>
                            setData("contact_email", e.target.value)
                          }
                        />
                        {errors.contact_email && (
                          <p className="mt-1 text-sm text-red-500 font-semibold">
                            {errors.contact_email}
                          </p>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="contact_phone">
                          Contact Phone
                        </Label>
                        <Input
                          id="contact_phone"
                          type="tel"
                          className="mt-1.5"
                          placeholder="+1 234 567 890"
                          value={data.contact_phone}
                          onChange={(e) =>
                            setData("contact_phone", e.target.value)
                          }
                        />
                        {errors.contact_phone && (
                          <p className="mt-1 text-sm text-red-500 font-semibold">
                            {errors.contact_phone}
                          </p>
                        )}
                      </div>

                    </div>

                  </div>

                  {/* Submit Buttons */}
                  <div className="flex justify-end gap-3 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      className="cursor-pointer"
                      onClick={() => router.visit(route("admin.competitions"))}
                    >
                      Cancel
                    </Button>

                    <Button
                      type="submit"
                      className="cursor-pointer"
                      disabled={processing}
                    >
                      {processing
                        ? isEditing
                          ? "Updating..."
                          : "Creating..."
                        : isEditing
                        ? "Update Competition"
                        : "Create Competition"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>

      <Footer />
    </div>
  );
};

export default CreateAndEditCompetitionPages;
