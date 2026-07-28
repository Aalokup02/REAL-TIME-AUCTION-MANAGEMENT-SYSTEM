// Manual integration check: logs in a buyer and submits a bid to the local API.


async function run() {
  try {
    // login
    console.log("logging in...");
    let res = await fetch("http://localhost:5000/api/users/login", {
      method: "POST",
      headers:{ "Content-Type" : "application/json" },
      body: JSON.stringify({ email: "rahul@buyer.com", password: "password123" })
    });
    let data = await res.json();
    if (!data.token) {
        console.error("No token!", data);
        return;
    }
    const token = data.token;
    console.log("Login success! Token:", token.substring(0, 20) + "...");

    // get ongoing auctions
    console.log("Fetching auctions...");
    res = await fetch("http://localhost:5000/api/auctions");
    let auctions = await res.json();
    let ongoing = auctions.find(a => a.status === "active");
    if (!ongoing) {
        console.error("No active auctions");
        return;
    }
    console.log(`Bidding on ${ongoing.item_name} with current bid ${ongoing.current_highest_bid}`);

    // place bid
    const bid_amount = ongoing.current_highest_bid + 100;
    res = await fetch("http://localhost:5000/api/bids", {
      method: "POST",
      headers:{ 
        "Content-Type" : "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({ auction_id: ongoing._id, bid_amount })
    });
    data = await res.json();
    console.log("Bid Response:", res.status, data);

  } catch (err) {
    console.error(err);
  }
}

run();
