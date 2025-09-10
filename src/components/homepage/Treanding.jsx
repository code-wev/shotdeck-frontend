
import React from "react";
import Link from "next/link";

// react icons
import { CgFacebook } from "react-icons/cg";
import { BsInstagram, BsLinkedin, BsTwitter } from "react-icons/bs";

const Trending = () => {
  // Common link styles
  const linkStyle = "text-[0.9rem] hover-primary hover:underline cursor-pointer";

  // Generate URL with multiple filters
  const generateFilterUrl = (filters) => {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, values]) => {
      if (Array.isArray(values)) {
        values.forEach(value => params.append(key, value));
      } else {
        params.append(key, values);
      }
    });
    
    return `/browse?${params.toString()}`;
  };

  // Trending sections with filters that match backend
  const trendingSections = [
    {
      title: "Recently Added",
      items: [
        { 
          label: "New Releases", 
          filters: { sortBy: "recentlyAdded" } 
        },
        { 
          label: "Digital Shots", 
          filters: { format: "Digital", } 
        },
        { 
          label: "Film Shots", 
          filters: { format: "Film - 35mm,Film - Super 8mm,Film - 65mm,Film - 16mm,Film - 70mm,Film - IMAX", sortBy: "recentlyAdded" } 
        }
      ]
    },
    {
      title: "Trending Films",
      items: [
        { 
          label: "Movie/TV", 
          filters: { genre: "movie,Movie/TV/TV,Movie/TV", sortBy: "mostPopular" } 
        },
        { 
          label: "Music Video", 
          filters: { genre: "Music Video", } 
        },
        { 
          label: "Commercial", 
          filters: { genre: "Commercial",  } 
        }
      ]
    },
    {
      title: "Trending Directors",
      items: [
        { 
          label: "Christopher Nolan", 
          filters: { director: "nolan" } 
        },
        { 
          label: "Martin Scorsese", 
          filters: { director: "scorsese", cinematographer: "deakins" } 
        },
        { 
          label: "Quentin Tarantino", 
          filters: { director: "tarantino" } 
        }
      ]
    },
    {
      title: "Trending DPs",
      items: [
        { 
          label: "Roger Deakins", 
          filters: { cinematographer: "deakins" } 
        },
        { 
          label: "Emmanuel Lubezki", 
          filters: { cinematographer: "lubezki" } 
        },
        { 
          label: "Janusz Kaminski", 
          filters: { cinematographer: "kaminski" } 
        }
      ]
    },
    {
      title: "Trending Searches",
      items: [
        { 
          label: "Night Scenes", 
          filters: { timeOfDay: "Night",  } 
        },
        { 
          label: "Day Scenes", 
          filters: { timeOfDay: "Day",  } 
        },
        { 
          label: "Warm Tones", 
          filters: { color: "Warm",  } 
        }
      ]
    }
  ];

  return (
    <footer className="bg-secondary shadow-md rounded-xl w-full p-6 md:p-9">
      <div className="flex justify-between gap-[30px] flex-wrap w-full">
        {trendingSections.map((section, index) => (
          <div key={index} className="min-w-[150px]">
            <h3 className="text-[1.2rem] font-semibold text-white mb-2 uppercase">
              {section.title}
            </h3>
            <div className="flex flex-col gap-[8px] text-secondary">
              {section.items.map((item, itemIndex) => (
                <Link 
                  key={itemIndex} 
                  href={generateFilterUrl(item.filters)} 
                  className={linkStyle}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Social Media Links */}
      {/* <div className="flex justify-center gap-6 mt-8">
        <a href="#" className="text-white hover:text-primary">
          <CgFacebook size={24} />
        </a>
        <a href="#" className="text-white hover:text-primary">
          <BsInstagram size={24} />
        </a>
        <a href="#" className="text-white hover:text-primary">
          <BsLinkedin size={24} />
        </a>
        <a href="#" className="text-white hover:text-primary">
          <BsTwitter size={24} />
        </a>
      </div> */}
    </footer>
  );
};

export default Trending;