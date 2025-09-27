import React from 'react';
import { Menu } from 'lucide-react';

const Header = ({ title }) => (
  <div className="md:hidden">
    <div className="flex items-center justify-between p-4 bg-white border-b">
      <button className="p-2">
        <Menu className="h-6 w-6" />
      </button>
      <h1 className="font-semibold">{title}</h1>
      <div className="w-8" />
    </div>
  </div>
);

export default Header;
