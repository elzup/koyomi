import { useState, useEffect, useCallback } from 'react'
import {
  collection,
  onSnapshot,
  addDoc,
  deleteDoc,
  doc,
} from 'firebase/firestore'
import type { User } from 'firebase/auth'
import { db } from '../lib/firebase'
import type { ContentItem } from '../types/content'
import { contents as sampleContents } from '../data/contents'

function contentsRef(uid: string) {
  return collection(db, 'users', uid, 'contents')
}

export function useContents(user: User | null) {
  const [items, setItems] = useState<readonly ContentItem[]>(sampleContents)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!user) {
      setItems(sampleContents)
      return
    }

    setLoading(true)
    const unsubscribe = onSnapshot(contentsRef(user.uid), (snapshot) => {
      const docs = snapshot.docs.map((d) => d.data() as ContentItem)
      setItems(docs)
      setLoading(false)
    })
    return unsubscribe
  }, [user])

  const addItem = useCallback(
    async (item: ContentItem) => {
      if (!user) return
      await addDoc(contentsRef(user.uid), { ...item })
    },
    [user],
  )

  const removeItem = useCallback(
    async (id: string) => {
      if (!user) return
      const ref = contentsRef(user.uid)
      const snapshot = await import('firebase/firestore').then(({ getDocs, query, where }) =>
        getDocs(query(ref, where('id', '==', id)))
      )
      for (const d of snapshot.docs) {
        await deleteDoc(doc(db, 'users', user.uid, 'contents', d.id))
      }
    },
    [user],
  )

  return { items, loading, addItem, removeItem }
}
