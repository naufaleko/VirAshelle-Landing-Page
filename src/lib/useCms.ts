import { useState, useEffect } from 'react';
import { supabase } from './supabase';

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
    items?: {
      title: string;
      desc: string;
    }[];
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
      desc?: string;
      type: 'image' | 'video';
      src: string;
      thumbnail_url?: string;
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
    title: "WE\n<span class=\"text-brand\">ARCHITECT</span>\nIDENTITY.",
    subtitle: "Video, motion graphics, 3D, and design for brands that need to be noticed in the first few seconds.",
    buttonText: "Chat on WhatsApp"
  },
  about: {
    title: "About Us",
    content: "<span class=\"text-brand font-semibold\">VirAshelle</span> is a multimedia studio in Jakarta. We make video, motion graphics, 3D, and design for brands.\n\n<span class=\"text-brand font-medium\">The job is simple to state and hard to do</span>: earn a viewer's attention in the first few seconds, then hold it long enough for the message to <span class=\"text-brand underline decoration-2 underline-offset-4\">land</span>."
  },
  services: {
    title: "What we do",
    description: "Four services, one team",
    items: [
      { title: "VIDEO EDITING", desc: "Cutting and pacing raw footage into commercial video that people watch to the end." },
      { title: "MOTION GRAPHIC", desc: "Animated type, illustration, and graphics for ads, explainer videos, and social feeds." },
      { title: "3D PRODUCTION", desc: "Modeling, animation, and rendering that show a product from angles and at a level of detail a camera cannot reach." },
      { title: "GRAPHIC DESIGN", desc: "Visual identity, packaging, promotional material, and social content that all follow the same brand rules." }
    ]
  },
  whyUs: {
    title: "Why VirAshelle?",
    description: "What you get when you work with us.",
    items: [
      { title: 'One team for everything visual', desc: '3D, animation, editing, and design come from the same people, so you brief once and the assets match each other.' },
      { title: 'Designed around the campaign goal', desc: 'Every visual starts from what the ad has to do, whether that is stopping the scroll or explaining the product. The look serves that.' },
      { title: 'Work you can see', desc: 'Our portfolio and the brands we have worked with are further down this page.' }
    ]
  },
  workflow: {
    title: "Our Workflow",
    items: [
      { number: "01", title: "Discovery", desc: "We read your brief and ask about the campaign goal and the product before proposing anything." },
      { number: "02", title: "Concept & Storyboard", desc: "Concept, script, and storyboard, approved by you before production starts." },
      { number: "03", title: "Production", desc: "Design, 3D modeling, animation, and editing, depending on what the concept needs." },
      { number: "04", title: "Review & Delivery", desc: "You review, we revise, and you receive the final files in the formats your channels need." }
    ]
  },
  portfolio: {
    title: "Selected Works.",
    description: "Recent projects.",
    items: [
      { id: "1", title: "[Placeholder] Project title", category: "[Category]", type: "image", src: "https://images.unsplash.com/photo-1558655146-d09347e92766?q=80&w=1000&auto=format&fit=crop" },
      { id: "2", title: "[Placeholder] Project title", category: "[Category]", type: "image", src: "https://images.unsplash.com/photo-1542038784456-1ea8e935640e?q=80&w=1000&auto=format&fit=crop" },
      { id: "3", title: "[Placeholder] Project title", category: "[Category]", type: "image", src: "https://images.unsplash.com/photo-1536240478700-b869070f9279?q=80&w=1000&auto=format&fit=crop" },
      { id: "4", title: "[Placeholder] Project title", category: "[Category]", type: "image", src: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1000&auto=format&fit=crop" }
    ]
  },
  milestone: {
    title: "Milestones",
    subtitle: "In numbers",
    items: [
      { status: "Projects delivered", count: "[REAL DATA]", desc: "Commercials, motion pieces, and 3D work shipped to clients.", color: "border-brand" },
      { status: "In production", count: "[REAL DATA]", desc: "Projects currently in the studio.", color: "border-brand-light" },
      { status: "Next", count: "[REAL DATA]", desc: "Interactive AR/VR web experiences.", color: "border-white/20" }
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
      name: "Dixon",
      role: "Production",
      desc: "The builder. Takes the concept and turns it into a high-quality visual reality.",
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
    subtitle: "Brands we have worked with.",
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
    title: "SEND US<br/>YOUR <span class=\"text-brand\">BRIEF</span>.",
    email: "virashelle@gmail.com",
    phones: ["+62 88 1212 8323", "+62 851 7333 9084"],
    address: "Jakarta, Indonesia"
  }
};

// Helper to sanitize old firestore data
const sanitizeData = (obj: any): any => {
  if (typeof obj === 'string') {
    return obj
      .replace(/text-\[#7d39eb\]/g, 'text-brand')
      .replace(/border-\[#7d39eb\]/g, 'border-brand')
      .replace(/bg-\[#7d39eb\]/g, 'bg-brand')
      .replace(/text-\[#a472f2\]/g, 'text-brand-light')
      .replace(/border-\[#a472f2\]/g, 'border-brand-light');
  }
  if (Array.isArray(obj)) {
    return obj.map(sanitizeData);
  }
  if (obj && typeof obj === 'object') {
    const newObj: any = {};
    for (const key in obj) {
      newObj[key] = sanitizeData(obj[key]);
    }
    return newObj;
  }
  return obj;
};

const isNonEmptyObject = (val: any) =>
  val && typeof val === 'object' && !Array.isArray(val) && Object.keys(val).length > 0;

const mergeContent = (base: SiteContent, incoming: any): SiteContent => {
  if (!incoming || typeof incoming !== 'object') return base;

  return {
    hero: isNonEmptyObject(incoming.hero) ? { ...base.hero, ...incoming.hero } : base.hero,
    about: isNonEmptyObject(incoming.about) ? { ...base.about, ...incoming.about } : base.about,
    services: isNonEmptyObject(incoming.services) && Array.isArray(incoming.services.items) && incoming.services.items.length > 0
      ? { ...base.services, ...incoming.services }
      : base.services,
    whyUs: isNonEmptyObject(incoming.whyUs) && Array.isArray(incoming.whyUs.items) && incoming.whyUs.items.length > 0
      ? { ...base.whyUs, ...incoming.whyUs }
      : base.whyUs,
    workflow: isNonEmptyObject(incoming.workflow) && Array.isArray(incoming.workflow.items) && incoming.workflow.items.length > 0
      ? { ...base.workflow, ...incoming.workflow }
      : base.workflow,
    portfolio: isNonEmptyObject(incoming.portfolio) && Array.isArray(incoming.portfolio.items) && incoming.portfolio.items.length > 0
      ? { ...base.portfolio, ...incoming.portfolio }
      : base.portfolio,
    milestone: isNonEmptyObject(incoming.milestone) && Array.isArray(incoming.milestone.items) && incoming.milestone.items.length > 0
      ? { ...base.milestone, ...incoming.milestone }
      : base.milestone,
    keyPeople: Array.isArray(incoming.keyPeople) && incoming.keyPeople.length > 0
      ? incoming.keyPeople
      : base.keyPeople,
    clients: isNonEmptyObject(incoming.clients) && Array.isArray(incoming.clients.items) && incoming.clients.items.length > 0
      ? { ...base.clients, ...incoming.clients }
      : base.clients,
    header: isNonEmptyObject(incoming.header) ? { ...base.header, ...incoming.header } : base.header,
    footer: isNonEmptyObject(incoming.footer) ? { ...base.footer, ...incoming.footer } : base.footer,
  };
};

export function useCms() {
  const [content, setContent] = useState<SiteContent>(defaultContent);
  const [loading, setLoading] = useState(true);
  // Set when the live row could not be read. The page still renders the fallback, but the
  // CMS must not save it: that would overwrite the live content with defaultContent.
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchContent = async () => {
      const { data, error: fetchError } = await supabase
        .from('site_content')
        .select('*')
        .eq('id', 'main')
        .single();

      // PGRST116 = no row yet; the fallback is the correct content in that case.
      if (fetchError && fetchError.code !== 'PGRST116') {
        setError(fetchError.message);
      }

      if (data) {
        const mappedData = {
          ...data,
          whyUs: data.why_us ?? data.whyUs,
          keyPeople: data.key_people ?? data.keyPeople
        };
        setContent(mergeContent(defaultContent, sanitizeData(mappedData)));
      } else {
        setContent(defaultContent);
      }
      setLoading(false);
    };

    fetchContent();

    const channel = supabase
      .channel('cms')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'site_content', filter: 'id=eq.main' }, (payload) => {
        const newData = payload.new as any;
        if (newData) {
          const mappedData = {
            ...newData,
            whyUs: newData.why_us ?? newData.whyUs,
            keyPeople: newData.key_people ?? newData.keyPeople
          };
          setContent((prev) => mergeContent(prev, sanitizeData(mappedData)));
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Throws on failure so the caller can show the error where the user is looking.
  const updateContent = async (newContent: SiteContent) => {
    const { whyUs, keyPeople, ...rest } = newContent;
    const contentFields = {
      ...rest,
      why_us: whyUs,
      key_people: keyPeople
    };

    const { error: saveError } = await supabase
      .from('site_content')
      .upsert({ id: 'main', ...contentFields, updated_at: new Date().toISOString() });

    if (saveError) {
      console.error("Failed to update content", saveError);
      throw new Error(saveError.message);
    }
    // Realtime echoes the row back, but only if the channel is up; set it here so the
    // page never shows the old content after a save that succeeded.
    setContent(newContent);
  };

  return { content, loading, error, updateContent };
}
