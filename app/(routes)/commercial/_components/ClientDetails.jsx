"use client";

import { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import Details from '../_components/Details';

export default function ClientDetails({ listingDetail }) {
  const [isSignedIn, setIsSignedIn] = useState(false);
  const supabase = createClientComponentClient();

  useEffect(() => {
    async function checkSession() {
      const { data: { session } } = await supabase.auth.getSession();
      setIsSignedIn(!!session);
    }
    checkSession();
  }, [supabase]);

  return <Details listingDetail={listingDetail} isSignedIn={isSignedIn} />;
}