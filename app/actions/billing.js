"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import Stripe from "stripe"
import { redirect } from "next/navigation"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder', {
  apiVersion: '2023-10-16',
})

export async function createCheckoutSession() {
  const session = await auth()
  if (!session?.user) return { error: "Unauthorized" }

  const user = await prisma.user.findUnique({ where: { id: session.user.id } })
  if (!user) return { error: "User not found" }

  let customerId = user.stripeCustomerId

  if (!customerId) {
    try {
      const customer = await stripe.customers.create({
        email: user.email || undefined,
        metadata: { userId: user.id }
      })
      customerId = customer.id
      await prisma.user.update({
        where: { id: user.id },
        data: { stripeCustomerId: customerId }
      })
    } catch (err) {
      console.error(err)
      return { error: "Failed to create Stripe customer" }
    }
  }

  try {
    const checkoutSession = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'setup',
      payment_method_types: ['card'],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/admin/account/billing?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/admin/account/billing?canceled=true`,
    })

    return { url: checkoutSession.url }
  } catch (err) {
    console.error(err)
    return { error: "Failed to create checkout session" }
  }
}
