import React from 'react'
import { getUserTestDrives } from "@/actions/test-drive";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { ReservationsList } from './_components/reservations-list';



export const metadata = {
  title: 'My Reservations | Carked Limited',
  description: 'Manage your reservations and bookings with ease. View upcoming reservations, modify existing ones, and stay organized with our user-friendly reservation management system.',
}

export default async function ReservationsPage() {
  // Check authentication on server
  const { userId } = await auth();
  if (!userId) {
    redirect("/sign-in?redirect=/reservations");
  }

  // Fetch reservations on the server
  const reservationsResult = await getUserTestDrives();

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-6xl mb-6 ">Your Reservations</h1>
      <ReservationsList initialData={reservationsResult} />
    </div>
  );
}