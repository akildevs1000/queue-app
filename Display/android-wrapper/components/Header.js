import { MaterialIcons } from "@expo/vector-icons";
import React from "react";
import { View, Text, ScrollView } from "react-native";

// Helper function to format date
function formatDate(date) {
  const day = date.getDate();
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const month = monthNames[date.getMonth()];
  const year = date.getFullYear();

  let hours = date.getHours();
  let minutes = date.getMinutes();
  if (minutes < 10) minutes = "0" + minutes; // add leading zero

  return `${day} ${month} ${year} ${hours}:${minutes}`;
}

export default function Header() {
  const now = new Date(); // Current date and time
  const formattedDate = formatDate(now);

  return (
    <ScrollView style={{ flex: 1, backgroundColor: "#0A1024" }}>
      <View
        style={{
          paddingVertical: 20,
          paddingLeft: 30,
          paddingRight: 30,
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Text style={{ color: "#E0E0E0", fontSize: 28 }}>Emirates Islamic</Text>
        <Text style={{ color: "#E0E0E0", fontSize: 22 }}>
          {formattedDate} <MaterialIcons name="campaign" size={26} color="#67E8F9" />
        </Text>
      </View>
    </ScrollView>
  );
}
