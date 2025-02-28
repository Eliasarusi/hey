// קובץ: /components/EmojiInput.tsx
import React, { useState } from 'react';

const EmojiInput: React.FC = () => {
  // מצב לאחסון התו/האימוג'י הנבחר
  const [char, setChar] = useState('');

  // טיפול בשינוי בתיבת הטקסט – נשמור תמיד את התו האחרון שהוקלד
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    const newChar = inputValue.slice(-1); // לוקח את התו האחרון
    setChar(newChar);
  };

  return (
    <div className="p-4">
      <label htmlFor="emoji-input" className="block mb-2 font-bold">
        בחר תו או אימוג'י:
      </label>
      <input
        id="emoji-input"
        type="text"
        value={char}
        onChange={handleChange}
        placeholder="הכנס תו או אימוג'י"
        className="border rounded p-2 w-full"
      />
      <p className="mt-4">
        תו נבחר: <span className="text-2xl">{char}</span>
      </p>
    </div>
  );
};

export default EmojiInput;
