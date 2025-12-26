"use client";

import { useState } from "react";
import Image from "next/image";

const SearchBar = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  const handleSearchSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    // Show alert with the search query instead of displaying results
    alert(`Search submitted: ${searchQuery}`);
    // Optionally clear the search query after submission
    setSearchQuery('');
  };

  return (
    <div>
      <form
        onSubmit={handleSearchSubmit}
        className="flex position-sticky top-20px items-center w-[250px] border border-[#41475E] rounded-md p-2 shadow-md absolute top-24 right-10 bg-white"
      >
        {/* Ikon Pencarian */}
        <Image
          src="/searchIcon.svg"
          alt="Search Icon"
          width={20}
          height={20}
          className="mr-3"
        />

        {/* Input Pencarian dengan border */}
        <input
          type="text"
          value={searchQuery}
          onChange={handleSearchChange}
          placeholder="Search for Trainings"
          className="w-full p-1 text-sm border-none outline-none"
        />
      </form>
    </div>
  );
};

export default SearchBar;