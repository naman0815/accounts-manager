const TAXONOMY = {
  "Food & Dining": [
    "Breakfast", "Lunch", "Dinner", "Snacks", "Restaurants", "Cafes", "Pubs", "Alcohol",
    "Tea", "Chai", "Coffee", "Groceries", "Kirana", "Milk", "Dairy", "Vegetables", "Meat", "Eggs", "Swiggy", "Zomato"
  ],
  "Lifestyle & Entertainment": [
    "Movies", "OTT", "Bowl", "Bowling", "Concert", "Hobbies", "Vices", "Shopping", "Clothes",
    "Footwear", "Accessories", "Home Decor", "Netflix", "Prime", "Hotstar", "Spotify"
  ],
  "Transport & Travel": [
    "Metro", "Bus", "Train", "Auto", "Rickshaw", "Uber", "Ola", "Rapido", "Namma Yatri",
    "Petrol", "Diesel", "EV", "Fuel", "Service", "Parking", "FastTag", "Toll", "Flight", "IRCTC", "Cab", "Taxi"
  ],
  "Bills & Services": [
    "Rent", "Maintenance", "Water", "Electricity", "Bescom", "Gas", "LPG", "Cylinder", "Mobile", "Recharge", "Jio", "Airtel", "Vodafone",
    "Broadband", "WiFi", "Internet", "DTH", "Tata Sky", "Maid", "Cook", "Laundry", "Dry Clean", "Tailor", "Courier",
    "Carpenter", "Plumber", "Electrician", "Urban Company", "UC"
  ],
  "Health & Fitness": [
    "Doctor", "Consultation", "Pharmacy", "Medicine", "Tablet", "Lab", "Test", "Gym", "Sports", "Turf", "Badminton",
    "Cricket", "Football", "Nutrition", "Supplement", "Protein", "Grooming", "Salon", "Haircut"
  ],
  "Shopping & Electronics": [
    "Phone", "Mobile", "Electronics", "Gadget", "Kitchen", "Utensil", "Appliance"
  ],
  "Finance & EMIs": [
    "Loan", "EMI", "Credit Card", "Bill", "Bank", "Charge", "Fine", "Challan", "Insurance", "Premium"
  ],
  "Investments & Wallets": [
    "Mutual Fund", "SIP", "Stock", "Share", "IPO", "Gold", "SGB", "PF", "PPF", "FD", "RD", "UPI Lite", "Wallet"
  ],
  "Income & Credits": [
    "Salary", "Business", "Bonus", "Pocket Money", "Gift", "Cashback", "Refund", "Interest", "Dividend", "Borrow", "Lend", "Debt", "Transfer"
  ]
};

function classifyText(text) {
  const lowerText = text.toLowerCase();

  for (const [category, tags] of Object.entries(TAXONOMY)) {
    for (const tag of tags) {
      if (lowerText.includes(tag.toLowerCase())) {
        // Map heuristics for compound tags
        let finalTag = tag;
        if (["Tea", "Chai", "Coffee"].includes(tag)) finalTag = "Tea/Chai";
        if (["Swiggy", "Zomato"].includes(tag)) finalTag = "Swiggy/Zomato";
        if (["Uber", "Ola", "Cab", "Taxi"].includes(tag)) finalTag = "Uber/Ola";
        if (["Milk", "Dairy"].includes(tag)) finalTag = "Milk/Dairy";
        if (["Meat", "Eggs"].includes(tag)) finalTag = "Meat/Eggs";
        if (["Auto", "Rickshaw"].includes(tag)) finalTag = "Auto Rickshaw";
        if (["Maid", "Cook"].includes(tag)) finalTag = "Maid/Cook Salary";
        if (["Laundry", "Dry Clean"].includes(tag)) finalTag = "Laundry/Dry Clean";

        return { category, tag: finalTag };
      }
    }
  }

  return { category: "Others", tag: "General" };
}

/**
 * Parses a natural language string into a structured expense transaction.
 * @param {string} input - The user input string.
 * @returns {object|null} - The structured transaction or null if failed.
 */
export function parseExpense(input) {
  if (!input || !input.trim()) return null;
  const text = input.trim();

  // Regex patterns
  // 1. "50 groceries" or "50 for groceries"
  const amountFirstRegex = /^(\d+(\.\d{1,2})?)\s+(?:for\s+|on\s+)?(.+)$/i;

  // 2. "groceries 50"
  const categoryFirstRegex = /^(.+?)\s+(\d+(\.\d{1,2})?)$/i;

  // 3. "spent 50 on groceries"
  const spentRegex = /^spent\s+(\d+(\.\d{1,2})?)\s+(?:on\s+|for\s+)(.+)$/i;

  let amount, description;

  let match = text.match(spentRegex);
  if (match) {
    amount = parseFloat(match[1]);
    description = match[3];
  } else {
    match = text.match(amountFirstRegex);
    if (match) {
      amount = parseFloat(match[1]);
      description = match[3];
    } else {
      match = text.match(categoryFirstRegex);
      if (match) {
        amount = parseFloat(match[2]);
        description = match[1];
      }
    }
  }

  // Fallback: Check if there is ANY number in the text
  if (!amount || !description) {
    const numberMatch = text.match(/(\d+(\.\d{1,2})?)/);
    if (numberMatch) {
      amount = parseFloat(numberMatch[0]);
      // Description is everything else
      description = text.replace(numberMatch[0], '').trim();
      if (!description) description = "General";
    }
  }

  if (amount) {
    const { category, tag } = classifyText(description);

    // Determine Type (Income/Expense)
    // Check for explicit "credit", "income", "added"
    const lowerDesc = description.toLowerCase();
    let type = 'expense';

    if (category === "Income & Credits" ||
      lowerDesc.includes('credited') ||
      lowerDesc.includes('income') ||
      lowerDesc.includes('added') ||
      lowerDesc.includes('received')) {
      type = 'income';
    }

    const finalTag = (category === "Others" && tag === "General") ? description : tag;

    return {
      id: crypto.randomUUID(),
      amount,
      type,         // 'income' or 'expense'
      category,     // The broad category
      tag: finalTag, // The specific tag
      description: description.trim(),
      date: new Date().toISOString(),
      rawInput: text
    };
  }
  return null;
}

export function parseMultipleExpenses(input) {
  if (!input) return [];

  // Split by comma or " and " (case insensitive)
  // Careful not to split decimals like 1,000 (though we generally expect 1000)
  // Simple split by comma for now
  const parts = input.split(/,| and /i);

  const results = [];
  for (const part of parts) {
    const parsed = parseExpense(part);
    if (parsed) {
      // Regenerate ID to ensure uniqueness if logic in parseExpense uses time-based/random seeds that might collide
      parsed.id = crypto.randomUUID();
      results.push(parsed);
    }
  }
  return results;
}
