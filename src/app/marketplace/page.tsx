'use client'
import { useEffect, useMemo, useState } from "react"
import NavBar from "../components/NavBar"
import { useAppDispatch, useAppSelector } from "../lib/hooks"
import { CasualUser, Post, UserDetails } from "../utils/StorageDataTypes"
import { GenerateInitialMarketplaceCluster } from "../utils/FakePostFactory/FakePostFactory"
import { addPostsToOriginalAccount } from "../lib/slices/sessionGeneratedAccountsSlice"
import '@/app/style.css'
import MarketplaceContent from "../organisms/MarketplacePage"

const selfToken = process.env.NEXT_PUBLIC_SELF

const MarketplacePage = () => {
  const dispatch = useAppDispatch()

  const userPosts = useAppSelector(state => state.posts.userPosts)
  const accountsPost = useAppSelector(state => state.sessionGeneratedAccounts.acc.flatMap(account => account.posts))
  const allAccounts = useAppSelector(state => state.sessionGeneratedAccounts.acc)
  const marketPlacePostsCount = useAppSelector(state => 
    state.sessionGeneratedAccounts.acc.reduce((acc, account) => 
      acc + account.posts.filter(post => post.body && typeof post.body === "object" && 'marketplacePhotoUrl' in post.body).length, 0
    )
  )

  const random3Auth = useMemo(() => {
    return allAccounts.length > 0 
      ? Array.from({ length: 3 }, () => {
          const randomAccount = allAccounts[Math.floor(Math.random() * allAccounts.length)]
          return {
            userName: randomAccount.name,
            profilepicture: randomAccount.profilePic
          }
        })
      : []
  }, [allAccounts])

  const postNumber = useMemo(() => userPosts.length + accountsPost.length, [userPosts, accountsPost])

  useEffect(() => {
    const fetchInitialCluster = async () => {
      const initialCluster = await GenerateInitialMarketplaceCluster(postNumber, random3Auth)
      dispatch(addPostsToOriginalAccount(initialCluster))
    }
    if (marketPlacePostsCount === 0) fetchInitialCluster()
  }, [dispatch, marketPlacePostsCount, postNumber, random3Auth])

  return (
    <>
      <NavBar />
      <MarketplaceContent />
    </>
  )
}

export default MarketplacePage
