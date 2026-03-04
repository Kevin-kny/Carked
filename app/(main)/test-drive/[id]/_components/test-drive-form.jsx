"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { format, parseISO } from "date-fns";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Calendar as CalendarIcon,
  Car,
  CheckCircle2,
  Loader2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent } from "@/components/ui/card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { cn } from "@/lib/utils";
import { bookTestDrive } from "@/actions/test-drive";
import { toast } from "sonner";
import useFetch from "@/hooks/use-fetch";

/* ---------------- SCHEMA ---------------- */

const testDriveSchema = z.object({
  date: z.date({
    required_error: "Please select a date for your test drive",
  }),
  timeSlot: z.string({
    required_error: "Please select a time slot",
  }),
  notes: z.string().optional(),
});

/* ---------------- COMPONENT ---------------- */

export function TestDriveForm({ car, testDriveInfo }) {
  const router = useRouter();

  const [availableTimeSlots, setAvailableTimeSlots] = useState([]);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [bookingDetails, setBookingDetails] = useState(null);

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(testDriveSchema),
    defaultValues: {
      date: undefined,
      timeSlot: "",
      notes: "",
    },
  });

  const dealership = testDriveInfo?.dealership;
  const existingBookings = testDriveInfo?.existingBookings || [];
  const selectedDate = watch("date");

  const {
    loading: bookingInProgress,
    fn: bookTestDriveFn,
    data: bookingResult,
    error: bookingError,
  } = useFetch(bookTestDrive);

  /* ---------------- EFFECTS ---------------- */

  useEffect(() => {
    if (bookingResult?.success) {
      setBookingDetails({
        date: format(bookingResult.data.bookingDate, "EEEE, MMMM d, yyyy"),
        timeSlot: `${format(
          parseISO(`2022-01-01T${bookingResult.data.startTime}`),
          "h:mm a"
        )} - ${format(
          parseISO(`2022-01-01T${bookingResult.data.endTime}`),
          "h:mm a"
        )}`,
      });

      setShowConfirmation(true);
      reset();
    }
  }, [bookingResult, reset]);

  useEffect(() => {
    if (bookingError) {
      toast.error(
        bookingError.message || "Failed to book test drive. Please try again."
      );
    }
  }, [bookingError]);

  useEffect(() => {
    if (!selectedDate || !dealership?.workingHours) return;

    const dayName = format(selectedDate, "EEEE").toUpperCase();
    const daySchedule = dealership.workingHours.find(
      (d) => d.dayOfWeek === dayName
    );

    if (!daySchedule || !daySchedule.isOpen) {
      setAvailableTimeSlots([]);
      return;
    }

    const openHour = parseInt(daySchedule.openTime.split(":")[0]);
    const closeHour = parseInt(daySchedule.closeTime.split(":")[0]);

    const slots = [];

    for (let hour = openHour; hour < closeHour; hour++) {
      const startTime = `${hour.toString().padStart(2, "0")}:00`;
      const endTime = `${(hour + 1).toString().padStart(2, "0")}:00`;

      const isBooked = existingBookings.some(
        (b) =>
          b.date === format(selectedDate, "yyyy-MM-dd") &&
          (b.startTime === startTime || b.endTime === endTime)
      );

      if (!isBooked) {
        slots.push({
          id: `${startTime}-${endTime}`,
          label: `${startTime} - ${endTime}`,
          startTime,
          endTime,
        });
      }
    }

    setAvailableTimeSlots(slots);
    setValue("timeSlot", "");
  }, [selectedDate]);

  const isDayDisabled = (day) => {
    if (day < new Date()) return true;

    const dayName = format(day, "EEEE").toUpperCase();
    const schedule = dealership?.workingHours?.find(
      (d) => d.dayOfWeek === dayName
    );

    return !schedule || !schedule.isOpen;
  };

  const onSubmit = async (data) => {
    const slot = availableTimeSlots.find((s) => s.id === data.timeSlot);

    if (!slot) {
      toast.error("Selected time slot is not available");
      return;
    }

    await bookTestDriveFn({
      carId: car.id,
      bookingDate: format(data.date, "yyyy-MM-dd"),
      startTime: slot.startTime,
      endTime: slot.endTime,
      notes: data.notes || "",
    });
  };

  const handleCloseConfirmation = () => {
    setShowConfirmation(false);
    router.push(`/cars/${car.id}`);
  };

  /* ---------------- UI ---------------- */

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
      {/* LEFT — CAR SUMMARY */}
      <div className="lg:col-span-1 lg:sticky lg:top-24 h-fit space-y-6">
        <Card className="border-0 shadow-md">
          <CardContent className="p-6">
            <div className="aspect-[4/3] rounded-xl overflow-hidden relative mb-5">
              {car.images?.length ? (
                <>
                  <img
                    src={car.images[0]}
                    alt={`${car.year} ${car.make} ${car.model}`}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                </>
              ) : (
                <div className="w-full h-full bg-muted flex items-center justify-center">
                  <Car className="h-12 w-12 text-muted-foreground" />
                </div>
              )}
            </div>

            <h3 className="text-xl font-semibold tracking-tight">
              {car.year} {car.make} {car.model}
            </h3>

            <div className="mt-1 text-2xl font-bold text-primary">
              Ksh. {car.price.toLocaleString()}
            </div>

            <div className="mt-4 rounded-lg bg-muted/40 p-4 text-sm space-y-2">
              {[
                ["Mileage", `${car.mileage.toLocaleString()} kilometers`],
                ["Fuel", car.fuelType],
                ["Transmission", car.transmission],
                ["Body", car.bodyType],
                ["Color", car.color],
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between">
                  <span className="text-muted-foreground">{label}</span>
                  <span className="font-medium">{value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-muted/30 border-dashed">
          <CardContent className="p-5 text-sm space-y-1">
            <p className="font-medium">
              {dealership?.name || "Carked Limited"}
            </p>
            <p className="text-muted-foreground">
              {dealership?.address || "Address not available"}
            </p>
            <p className="pt-2">
              <span className="font-medium">Phone:</span>{" "}
              {dealership?.phone || "Not available"}
            </p>
            <p>
              <span className="font-medium">Email:</span>{" "}
              {dealership?.email || "Not available"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* RIGHT — BOOKING FORM */}
      <div className="lg:col-span-2">
        <Card className="border-0 shadow-xl">
          <CardContent className="p-8">
            <h2 className="text-2xl font-semibold tracking-tight mb-2">
              Schedule Your Test Drive
            </h2>
            <p className="text-sm text-muted-foreground mb-8">
              Choose a date and time that works best for you
            </p>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* DATE */}
              <div className="rounded-lg border p-4 space-y-2">
                <label className="text-sm font-medium">Select Date</label>
                <Controller
                  name="date"
                  control={control}
                  render={({ field }) => (
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {field.value
                            ? format(field.value, "PPP")
                            : "Pick a date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="p-0">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={isDayDisabled}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  )}
                />
                {errors.date && (
                  <p className="text-sm text-red-500">
                    {errors.date.message}
                  </p>
                )}
              </div>

              {/* TIME */}
              <div className="rounded-lg border p-4 space-y-2">
                <label className="text-sm font-medium">Time Slot</label>
                <Controller
                  name="timeSlot"
                  control={control}
                  render={({ field }) => (
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                      disabled={!selectedDate || !availableTimeSlots.length}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select time slot" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableTimeSlots.map((slot) => (
                          <SelectItem key={slot.id} value={slot.id}>
                            {slot.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.timeSlot && (
                  <p className="text-sm text-red-500">
                    {errors.timeSlot.message}
                  </p>
                )}
              </div>

              {/* NOTES */}
              <div className="rounded-lg border p-4 space-y-2">
                <label className="text-sm font-medium">
                  Additional Notes (optional)
                </label>
                <Controller
                  name="notes"
                  control={control}
                  render={({ field }) => (
                    <Textarea
                      {...field}
                      placeholder="Any special requests?"
                      className="min-h-24"
                    />
                  )}
                />
              </div>

              <Button
                type="submit"
                size="lg"
                className="w-full text-base font-semibold"
                disabled={bookingInProgress}
              >
                {bookingInProgress ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Booking...
                  </>
                ) : (
                  "Book Test Drive"
                )}
              </Button>
            </form>

            <div className="mt-10 rounded-xl bg-green-50 p-5">
              <h3 className="font-semibold text-green-800 mb-3">
                What happens next
              </h3>
              <ul className="space-y-2 text-sm text-green-700">
                {[
                  "Bring your driver's license",
                  "Test drive lasts 30–60 minutes",
                  "A representative will accompany you",
                ].map((item) => (
                  <li key={item} className="flex gap-2">
                    <CheckCircle2 className="h-4 w-4 mt-0.5" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* CONFIRMATION */}
      <Dialog open={showConfirmation} onOpenChange={setShowConfirmation}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex flex-col items-center gap-2 text-center">
              <CheckCircle2 className="h-8 w-8 text-green-500" />
              Test Drive Booked!
            </DialogTitle>
            <DialogDescription className="text-center">
              Your booking has been confirmed
            </DialogDescription>
          </DialogHeader>

          {bookingDetails && (
            <div className="py-4 space-y-3 text-sm">
              <div className="flex justify-between">
                <span>Car</span>
                <span className="font-medium">
                  {car.year} {car.make} {car.model}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Date</span>
                <span className="font-medium">{bookingDetails.date}</span>
              </div>
              <div className="flex justify-between">
                <span>Time</span>
                <span className="font-medium">{bookingDetails.timeSlot}</span>
              </div>
            </div>
          )}

          <div className="flex justify-end">
            <Button onClick={handleCloseConfirmation}>Done</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
