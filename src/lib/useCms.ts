import { useState, useEffect } from 'react';
import { db } from './firebase';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';

export type SiteContent = {
  hero: {
    title: string;
    subtitle: string;
    buttonText: string;
  };
  about: {
    title: string;
    content: string;
  };
  services: {
    title: string;
    description: string;
    items: {
      title: string;
      desc: string;
    }[];
  };
  whyUs: {
    title: string;
    description: string;
  };
  workflow: {
    title: string;
    items: {
      number: string;
      title: string;
      desc: string;
    }[];
  };
  portfolio: {
    title: string;
    description: string;
    items: {
      id: string;
      title: string;
      category: string;
      type: 'image' | 'video';
      src: string;
    }[];
  };
  milestone: {
    title: string;
    subtitle: string;
    items: {
      status: string;
      count: string;
      desc: string;
      color: string;
    }[];
  };
  keyPeople: {
    name: string;
    role: string;
    desc: string;
    imageUrl: string;
  }[];
  clients: {
    title: string;
    subtitle: string;
    description?: string;
    items: { name: string; logoUrl: string }[];
  };
  header: {
    established: string;
  };
  footer: {
    title: string;
    email: string;
    phones: string[];
    address: string;
  };
};

const defaultContent: SiteContent = {
  hero: {
    title: "WE\n<span class=\"text-[#7d39eb]\">ARCHITECT</span>\nIDENTITY.",
    subtitle: "A creative collective pushing the boundaries of spatial and digital experiences through geometric precision and radical aesthetics.",
    buttonText: "Launch Project"
  },
  about: {
    title: "About Us",
    content: "<span class=\"text-[#7d39eb] font-semibold\">VirAshelle</span> is a modern multimedia creative studio specializing in high-impact digital visual production.\n\n<span class=\"text-[#7d39eb] font-medium\">We exist to help your brand communicate more powerfully</span>, capture audience's attention within the first few seconds, and turn viewers into <span class=\"text-[#7d39eb] underline decoration-2 underline-offset-4\">loyal admirers</span>."
  },
  services: {
    title: "What We Can Do?",
    description: "Our Services",
    items: [
      { title: "VIDEO EDITING", desc: "Crafting, pacing, and polishing video footage into rhythmic, emotional, and high-converting commercial narratives." },
      { title: "MOTION GRAPHIC", desc: "Bringing graphic elements, typography, and illustrations to life through dynamic animation for digital ads, explainer videos, and social media content." },
      { title: "3D PRODUCTION", desc: "Asset creation, 3D modeling, animation, and rendering to showcase product details in a pristine, premium manner that conventional cameras cannot replicate." },
      { title: "GRAPHIC DESIGN", desc: "Developing visual identities, product packaging designs, promotional materials, and aesthetic social media content that aligns perfectly with your brand DNA." }
    ]
  },
  whyUs: {
    title: "Why VirAshelle?",
    description: "Data-driven creative decisions paired with radical aesthetics."
  },
  workflow: {
    title: "Our Workflow",
    items: [
      { number: "01", title: "Discovery & Ideation", desc: "Deep-dive discussions to understand your brief, campaign goals, and product identity." },
      { number: "02", title: "Concept & Storyboarding", desc: "Crafting the creative concept, script, and visual storyboard before moving into production." },
      { number: "03", title: "Production & Execution", desc: "Where the magic happens-our team begins designing, 3D modeling, animating, and editing." },
      { number: "04", title: "Review & Delivery", desc: "Collaborative evaluation to ensure the final output is flawless and ready to launch" }
    ]
  },
  portfolio: {
    title: "Selected Works.",
    description: "A curated selection of our recent projects. Update these dynamically from your Google Drive.",
    items: [
      { id: "1", title: "Neon Brand Identity", category: "Branding", type: "image", src: "https://images.unsplash.com/photo-1558655146-d09347e92766?q=80&w=1000&auto=format&fit=crop" },
      { id: "2", title: "Urban Streetwear Campaign", category: "Photography", type: "image", src: "https://images.unsplash.com/photo-1542038784456-1ea8e935640e?q=80&w=1000&auto=format&fit=crop" },
      { id: "3", title: "Future Tech Commercial", category: "Video Production", type: "image", src: "https://images.unsplash.com/photo-1536240478700-b869070f9279?q=80&w=1000&auto=format&fit=crop" },
      { id: "4", title: "Abstract 3D Motion", category: "Motion Graphics", type: "image", src: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1000&auto=format&fit=crop" }
    ]
  },
  milestone: {
    title: "Milestones",
    subtitle: "Our Journey",
    items: [
      { status: "Project Done", count: "45+", desc: "Successfully delivered high-impact visual campaigns.", color: "border-[#7d39eb]" },
      { status: "On Going Project", count: "12", desc: "Currently crafting digital experiences in the lab.", color: "border-[#a472f2]" },
      { status: "Future Plan", count: "2025", desc: "Expanding to interactive AR/VR web experiences.", color: "border-white/20" }
    ]
  },
  keyPeople: [
    {
      name: "Naufal Eko",
      role: "Leader",
      desc: "The captain. Sets the overall strategy, manages the client, and keeps the project moving.",
      imageUrl: ""
    },
    {
      name: "Marshall Ramsey",
      role: "Finance/Copywriter",
      desc: "Handles both the creative side of generating revenue through persuasive writing, and managing the budgets, expenses of the business.",
      imageUrl: ""
    },
    {
      name: "Matias Calderon",
      role: "Executant",
      desc: "The builder. Does the heavy lifting to turn the strategy and words into final designs, videos, or websites.",
      imageUrl: ""
    },
    {
      name: "Jessica Same",
      role: "Marketing",
      desc: "The promoter. Pushes the final assets live, runs the ads, and tracks the data to make sure it gets seen by the right people.",
      imageUrl: ""
    }
  ],
  clients: {
    title: "Our Clients",
    subtitle: "These are the brands that have been collaborated with our company!",
    items: [
      { name: "Telin", logoUrl: "" },
      { name: "Asbanda", logoUrl: "" },
      { name: "United Nations", logoUrl: "" },
      { name: "Sinarmas MSIG life", logoUrl: "" },
      { name: "Unileague", logoUrl: "" },
      { name: "Fiberstar", logoUrl: "" },
      { name: "Waskita", logoUrl: "" }
    ]
  },
  header: {
    established: "EST. 2024"
  },
  footer: {
    title: "LET'S <span class=\"text-[#7d39eb]\">BUILD</span><br/>THE FUTURE",
    email: "virashelle@gmail.com",
    phones: ["+62 88 1212 8323", "+62 851 7333 9084"],
    address: "Jakarta, Indonesia"
  }
};

export function useCms() {
  const [content, setContent] = useState<SiteContent>(defaultContent);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const docRef = doc(db, 'siteContent', 'main');
    
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setContent({ ...defaultContent, ...data });
      } else {
        setContent(defaultContent);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const updateContent = async (newContent: SiteContent) => {
    try {
      await setDoc(doc(db, 'siteContent', 'main'), newContent);
    } catch (error) {
      console.error("Failed to update content", error);
      alert("Failed to update content. Are you logged in as admin?");
    }
  };

  return { content, loading, updateContent };
}
