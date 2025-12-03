// Test script to verify watchlist functionality
async function testWatchlist() {
    const baseUrl = 'http://localhost:3000';

    console.log('Testing Watchlist API...\n');

    // Test 1: Get initial watchlist
    console.log('1. Getting initial watchlist...');
    let response = await fetch(`${baseUrl}/api/watchlist`);
    let data = await response.json();
    console.log('Initial watchlist:', data.map(item => item.symbol));
    console.log('');

    // Test 2: Add CEMPRO to watchlist
    console.log('2. Adding CEMPRO.NS to watchlist...');
    response = await fetch(`${baseUrl}/api/watchlist/toggle`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            symbol: 'CEMPRO.NS',
            name: 'Cemindia Projects Ltd'
        })
    });
    data = await response.json();
    console.log('Response:', data);
    console.log('');

    // Test 3: Get watchlist after adding CEMPRO
    console.log('3. Getting watchlist after adding CEMPRO...');
    response = await fetch(`${baseUrl}/api/watchlist`);
    data = await response.json();
    console.log('Watchlist now contains:', data.map(item => item.symbol));
    console.log('CEMPRO details:', data.find(item => item.symbol === 'CEMPRO.NS'));
    console.log('');

    // Test 4: Toggle CEMPRO again (should remove it)
    console.log('4. Toggling CEMPRO again (should remove)...');
    response = await fetch(`${baseUrl}/api/watchlist/toggle`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            symbol: 'CEMPRO.NS',
            name: 'Cemindia Projects Ltd'
        })
    });
    data = await response.json();
    console.log('Response:', data);
    console.log('');

    // Test 5: Verify CEMPRO was removed
    console.log('5. Verifying CEMPRO was removed...');
    response = await fetch(`${baseUrl}/api/watchlist`);
    data = await response.json();
    console.log('Final watchlist:', data.map(item => item.symbol));
    console.log('');

    console.log('✅ All tests completed!');
}

testWatchlist().catch(console.error);
