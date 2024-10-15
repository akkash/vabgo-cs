"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import Details from '../_components/Details';

export default function ClientDetails({ listingDetail }) {
  const [isSignedIn, setIsSignedIn] = useState(false);
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading) {
      setIsSignedIn(!!user);
    }
  }, [user, loading]);

  return <Details listingDetail={listingDetail} isSignedIn={isSignedIn} />;
}
