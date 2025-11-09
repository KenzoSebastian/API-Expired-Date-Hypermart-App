export const notificationTemplates = {
  expired: [
    {
      title: "Expired Alert: Time to Toss! 🗑️",
      message: (itemName, daysAgo) =>
        `${itemName} has officially crossed its expiration date ${daysAgo} days ago. Open the app to safely remove it from your inventory and keep things fresh!`,
    },
    {
      title: "Urgent: Item Has Expired! ⚠️",
      message: (itemName, daysAgo) =>
        `Heads up! Your ${itemName} is past its prime, expired ${daysAgo} days ago. Please check and discard it immediately to avoid any risks.`,
    },
    {
      title: "Waste Not, Want Not! Item is GONE!",
      message: (itemName, daysAgo) =>
        `Uh oh! Your inventory shows ${itemName} expired ${daysAgo} days ago. Tap here to update your stock and prevent spoilage.`,
    },
    {
      title: "Bummer! Item Hit Its Limit. 😟",
      message: (itemName, daysAgo) =>
        `It's official: ${itemName} expired ${daysAgo} days ago. Let's keep your pantry safe and clear it out!`,
    },
    {
      title: "Action Required: Expired Stock! 🛑",
      message: (itemName, daysAgo) =>
        `${itemName} expired ${daysAgo} days ago. Review your items and dispose of it responsibly through the app.`,
    },
  ],
  expiringSoon: [
    {
      title: "7-Day Countdown: Use It or Lose It! ⏰",
      message: (itemName, daysLeft) =>
        `${itemName} is expiring in just ${daysLeft} days! Plan to use it soon or find a recipe to make the most of it!`,
    },
    {
      title: "Heads Up! 🚨 Nearing Expiry",
      message: (itemName, daysLeft) =>
        `Your ${itemName} has only ${daysLeft} days left. Don't let it go to waste – time to get creative with it!`,
    },
    {
      title: "Quick Reminder: Consume Item Soon!",
      message: (itemName, daysLeft) =>
        `This week's priority: ${itemName} is approaching its best-before date in ${daysLeft} days. Tap to see ideas or mark for immediate use.`,
    },
    {
      title: "Don't Forget! Days Left for Item!",
      message: (itemName, daysLeft) =>
        `A friendly nudge: ${itemName} will expire in just ${daysLeft} days. Make sure it finds its way into your plans!`,
    },
    {
      title: "Last Chance! Item is on the Clock!",
      message: (itemName, daysLeft) =>
        `Your ${itemName} is set to expire in ${daysLeft} days. Open the app to check expiry details and make a plan.`,
    },
  ],
  expiringLater: [
    {
      title: "Planning Ahead: Item on the Horizon!",
      message: (itemName, daysLeft) =>
        `Just a heads-up! ${itemName} will expire in about ${daysLeft} days. Time to start thinking about using it.`,
    },
    {
      title: "Heads Up! 👀 Item Has ~2 Weeks Left",
      message: (itemName, daysLeft) =>
        `Your ${itemName} is reaching its limit in about ${daysLeft} days. A good time to put it on your grocery list to be used!`,
    },
    {
      title: "Mid-Term Reminder: Item Expiry!",
      message: (itemName, daysLeft) =>
        `Plan your meals or stock rotation! ${itemName} has roughly ${daysLeft} days before its expiry date.`,
    },
    {
      title: "A Little Nudge: Item Soon to Expire!",
      message: (itemName, daysLeft) =>
        `Don't let ${itemName} slip your mind! It's due to expire in approximately ${daysLeft} days.`,
    },
    {
      title: "Upcoming Expiry: Item on the Radar!",
      message: (itemName, daysLeft) =>
        `Get ready to use ${itemName}! It's expected to expire in the next ${daysLeft} days. Check details in the app.`,
    },
  ],
};
