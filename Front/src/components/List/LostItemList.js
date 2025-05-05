import React, { useEffect, useState } from "react";
import axios from "axios";

const LostItemList = () => {
  const [items, setItems] = useState([]);

  useEffect(() => {
    axios.get("http://localhost:8080/api/lost-items")
      .then((response) => {
        setItems(response.data);
      })
      .catch((error) => {
        console.error("Error fetching lost items:", error);
      });
  }, []);

  return (
    <div>
      <h2 class="text-center">รายการของหาย</h2>
      <ul>
        {items.map((item) => (
          <li key={item.id}>
            <strong>{item.name}</strong> - {item.description} ({item.place})
          </li>
        ))}
      </ul>
    </div>
  );
};

export default LostItemList;
