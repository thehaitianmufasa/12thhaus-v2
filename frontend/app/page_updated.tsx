'use client'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useAuth, useUser } from '@clerk/nextjs'

export default function Home() {
  const [featuredPractitioners, setFeaturedPractitioners] = useState([])
  const [loading, setLoading] = useState(true)
  const { isSignedIn, signOut } = useAuth()
  const { user } = useUser()

  // Fetch real practitioners from GraphQL
  useEffect(() => {
    const fetchPractitioners = async () => {
      try {
        const graphqlUrl = typeof window !== 'undefined' 
          ? '/api/graphql'  // Client-side URL
          : process