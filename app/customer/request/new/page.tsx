"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import Link from "next/link";
import { api } from "@/convex/_generated/api";
import { CustomerContactDialog } from "@/components/customer/CustomerContactDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowLeft,
  Wrench,
  MapPin,
  Calendar,
  Banknote,
  CheckCircle2,
  Loader2,
  FileText,
} from "lucide-react";

const SERVICE_CATEGORIES = [
  { id: "electrician", name: "Electrician / Electrical Works" },
  { id: "plumbing", name: "Plumber / Water Supply" },
  { id: "ac-repair", name: "AC Repair & Servicing" },
  { id: "carpenter", name: "Carpenter & Woodwork" },
  { id: "painter", name: "Painter & Wall Finishing" },
  { id: "appliance", name: "Home Appliance Repair" },
  { id: "cleaning", name: "Home & Office Cleaning" },
  { id: "general", name: "General Labour / Maintenance" },
];

const CITIES = [
  "Karachi",
  "Lahore",
  "Islamabad",
  "Rawalpindi",
  "Faisalabad",
  "Multan",
  "Peshawar",
  "Quetta",
];

export default function NewServiceRequestPage() {
  const currentUser = useQuery(api.authed.account.currentUser);

  const [category, setCategory] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [city, setCity] = useState("Karachi");
  const [area, setArea] = useState("");
  const [address, setAddress] = useState("");
  const [timing, setTiming] = useState("asap");
  const [budget, setBudget] = useState("");

  const [isContactDialogOpen, setIsContactDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const [errors, setErrors] = useState<{
    category?: string;
    title?: string;
    description?: string;
    area?: string;
  }>({});

  if (currentUser === undefined) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3">
        <Loader2 className="size-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Loading request form...</p>
      </div>
    );
  }

  const validateForm = () => {
    const newErrors: typeof errors = {};
    if (!category) newErrors.category = "Please select a service category.";
    if (!title.trim()) newErrors.title = "Request title is required.";
    if (!description.trim())
      newErrors.description = "Please describe the work required.";
    if (!area.trim()) newErrors.area = "Area / Neighborhood is required.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const executeRequestCreation = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
    }, 600);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    if (!currentUser?.phoneNumber) {
      setIsContactDialogOpen(true);
      return;
    }

    executeRequestCreation();
  };

  const handleContactSuccess = () => {
    executeRequestCreation();
  };

  if (isSuccess) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-8">
        <Card className="border-primary/20 bg-card text-center p-8">
          <CardContent className="flex flex-col items-center gap-4 pt-4">
            <div className="flex size-14 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400">
              <CheckCircle2 className="size-8" />
            </div>
            <div className="space-y-1">
              <h2 className="text-xl font-bold tracking-tight">
                Service Request Created!
              </h2>
              <p className="text-xs text-muted-foreground max-w-md mx-auto">
                Your service request &ldquo;{title}&rdquo; has been successfully submitted. Verified providers in {city} will be notified shortly.
              </p>
            </div>

            <div className="w-full max-w-md rounded-lg border border-border bg-muted/40 p-4 text-left space-y-2 mt-4 text-xs">
              <div className="flex justify-between py-1 border-b border-border/60">
                <span className="text-muted-foreground">Category:</span>
                <span className="font-medium">
                  {SERVICE_CATEGORIES.find((c) => c.id === category)?.name || category}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-border/60">
                <span className="text-muted-foreground">Location:</span>
                <span className="font-medium">{area}, {city}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-muted-foreground">Contact:</span>
                <span className="font-medium">{currentUser?.phoneNumber}</span>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <Button asChild variant="outline">
                <Link href="/customer">Back to Dashboard</Link>
              </Button>
              <Button onClick={() => {
                setIsSuccess(false);
                setTitle("");
                setDescription("");
                setArea("");
                setAddress("");
                setBudget("");
              }}>
                Create Another Request
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <Link
            href="/customer"
            className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground mb-2 transition-colors"
          >
            <ArrowLeft className="size-3.5" />
            Back to Customer Hub
          </Link>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Create Service Request
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Post your job requirements to get connected with verified local service providers.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wrench className="size-4 text-primary" />
              Service Details
            </CardTitle>
            <CardDescription>
              Select category and describe the work you need done.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="category" className="font-medium">
                Service Category <span className="text-destructive">*</span>
              </Label>
              <Select value={category} onValueChange={(val) => {
                setCategory(val);
                if (errors.category) setErrors((prev) => ({ ...prev, category: undefined }));
              }}>
                <SelectTrigger id="category" className="w-full">
                  <SelectValue placeholder="Select service category..." />
                </SelectTrigger>
                <SelectContent>
                  {SERVICE_CATEGORIES.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.category && (
                <p className="text-xs font-medium text-destructive">{errors.category}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="title" className="font-medium">
                Request Title / Short Headline <span className="text-destructive">*</span>
              </Label>
              <Input
                id="title"
                placeholder="e.g. Need electrician to fix ceiling fan & circuit breaker"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  if (errors.title) setErrors((prev) => ({ ...prev, title: undefined }));
                }}
                className="w-full"
              />
              {errors.title && (
                <p className="text-xs font-medium text-destructive">{errors.title}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="description" className="font-medium">
                Job Description <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="description"
                rows={4}
                placeholder="Describe the issue or task in detail. Mention any specific parts required or urgency..."
                value={description}
                onChange={(e) => {
                  setDescription(e.target.value);
                  if (errors.description) setErrors((prev) => ({ ...prev, description: undefined }));
                }}
                className="w-full min-h-24 resize-y"
              />
              {errors.description && (
                <p className="text-xs font-medium text-destructive">{errors.description}</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="size-4 text-primary" />
              Location & Schedule
            </CardTitle>
            <CardDescription>
              Specify where and when the work needs to be performed.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="city" className="font-medium">
                  City <span className="text-destructive">*</span>
                </Label>
                <Select value={city} onValueChange={setCity}>
                  <SelectTrigger id="city" className="w-full">
                    <SelectValue placeholder="Select city..." />
                  </SelectTrigger>
                  <SelectContent>
                    {CITIES.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="area" className="font-medium">
                  Area / Neighborhood <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="area"
                  placeholder="e.g. Gulshan-e-Iqbal, Block 5"
                  value={area}
                  onChange={(e) => {
                    setArea(e.target.value);
                    if (errors.area) setErrors((prev) => ({ ...prev, area: undefined }));
                  }}
                  className="w-full"
                />
                {errors.area && (
                  <p className="text-xs font-medium text-destructive">{errors.area}</p>
                )}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="address" className="font-medium">
                Street Address / Landmark <span className="text-xs text-muted-foreground">(Optional)</span>
              </Label>
              <Input
                id="address"
                placeholder="House / Shop #, Street name, landmark..."
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full"
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 pt-2">
              <div className="space-y-1.5">
                <Label htmlFor="timing" className="flex items-center gap-1.5 font-medium">
                  <Calendar className="size-3.5 text-muted-foreground" />
                  Preferred Timing
                </Label>
                <Select value={timing} onValueChange={setTiming}>
                  <SelectTrigger id="timing" className="w-full">
                    <SelectValue placeholder="Select timing..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="asap">As soon as possible</SelectItem>
                    <SelectItem value="today">Today</SelectItem>
                    <SelectItem value="tomorrow">Tomorrow</SelectItem>
                    <SelectItem value="this-week">Within this week</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="budget" className="flex items-center gap-1.5 font-medium">
                  <Banknote className="size-3.5 text-muted-foreground" />
                  Estimated Budget (PKR) <span className="text-xs text-muted-foreground">(Optional)</span>
                </Label>
                <Input
                  id="budget"
                  type="number"
                  placeholder="e.g. 1500"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  className="w-full"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center justify-end gap-3 pt-2">
          <Button asChild variant="outline">
            <Link href="/customer">Cancel</Link>
          </Button>
          <Button type="submit" disabled={isSubmitting} size="lg">
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <FileText className="mr-1.5 size-4" />
                Submit Service Request
              </>
            )}
          </Button>
        </div>
      </form>

      <CustomerContactDialog
        open={isContactDialogOpen}
        onOpenChange={setIsContactDialogOpen}
        onSuccess={handleContactSuccess}
        initialPhoneNumber={currentUser?.phoneNumber ?? ""}
        initialWhatsappNumber={currentUser?.whatsappNumber ?? ""}
      />
    </div>
  );
}
