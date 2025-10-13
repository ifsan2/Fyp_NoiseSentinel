// Test API Connection
// Open browser console and run this to test your API

const testAPIConnection = async () => {
  console.log("🔍 Testing API Connection...");
  console.log("Base URL:", "http://localhost:5200/api");

  try {
    const response = await fetch("http://localhost:5200/api/Auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: "officer01", // Replace with actual username
        password: "Password1234@", // Replace with actual password
      }),
    });

    console.log("📊 Response Status:", response.status);
    console.log("📊 Response Headers:", [...response.headers.entries()]);

    const data = await response.json();
    console.log("📊 Response Data:", data);

    if (response.ok) {
      console.log("✅ API Connection Successful!");
    } else {
      console.log("❌ API Error:", data);
    }
  } catch (error) {
    console.error("❌ Network Error:", error);
  }
};

// Run the test
testAPIConnection();
