// src/api/actions/tokenActions.js

export const fetchTokenCounts = async (counterId, localIp) => {
    if (!counterId) return null; // guard clause

    const token = localStorage.getItem("auth_token"); // get token from localStorage
    if (!token) {
        console.error("No auth token found");
        return null;
    }

    try {
        const res = await fetch(`http://${localIp}:8000/api/token-counts?counter_id=${counterId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`, // use token here
            },
        });

        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

        const json = await res.json();
        console.log(json);

        return json; // return data instead of setting state here
    } catch (err) {
        console.error('Failed to fetch token counts', err);
        return null;
    }
};


// action.js
export const fetchNextToken = async (localIp) => {
    try {
        const token = localStorage.getItem("auth_token");

        const res = await fetch(`http://${localIp}:8000/api/next-token`, {
            headers: {
                "Content-Type": "application/json",
                Authorization: token ? `Bearer ${token}` : "",
            },
        });

        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

        return res.json(); // return parsed JSON
    } catch (err) {
        console.error("Failed to fetch next token", err);
        return null;
    }
};

// action.js
export const startServingToken = async (localIp, tokenId, counterId) => {
  try {
    const token = localStorage.getItem("auth_token");

    const res = await fetch(
      `http://${localIp}:8000/api/start-serving/${tokenId}?counter_id=${counterId}`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
      }
    );

    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

    return res.json();
  } catch (err) {
    console.error("Failed to start serving token", err);
    return null;
  }
};
