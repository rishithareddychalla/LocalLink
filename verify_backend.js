const http = require('http');

const post = (path, data, token) => {
    return new Promise((resolve, reject) => {
        const req = http.request({
            hostname: 'localhost',
            port: 5000,
            path: `/api${path}`,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...(token && { 'Authorization': `Bearer ${token}` })
            }
        }, (res) => {
            let body = '';
            res.on('data', chunk => body += chunk);
            res.on('end', () => resolve({ status: res.statusCode, data: JSON.parse(body) }));
        });
        req.on('error', reject);
        req.write(JSON.stringify(data));
        req.end();
    });
};

const get = (path, token) => {
    return new Promise((resolve, reject) => {
        const req = http.request({
            hostname: 'localhost',
            port: 5000,
            path: `/api${path}`,
            method: 'GET',
            headers: {
                ...(token && { 'Authorization': `Bearer ${token}` })
            }
        }, (res) => {
            let body = '';
            res.on('data', chunk => body += chunk);
            res.on('end', () => resolve({ status: res.statusCode, data: JSON.parse(body) }));
        });
        req.on('error', reject);
        req.end();
    });
};

async function test() {
    try {
        console.log('Logging in...');
        const loginRes = await post('/auth/login', { nickname: 'Tester' });
        if (!loginRes.data.success) {
            console.error('Login failed:', loginRes.data);
            return;
        }
        const token = loginRes.data.data.token;
        console.log('Token received:', token.substring(0, 10) + '...');

        console.log('Creating room...');
        const createRes = await post('/rooms/create', { name: 'Test Room' }, token);
        console.log('Create Response:', createRes);

        console.log('Fetching rooms...');
        const roomsRes = await get('/rooms', token);
        console.log('Rooms List:', JSON.stringify(roomsRes.data.rooms, null, 2));

        if (roomsRes.data.rooms.some(r => r.name === 'Test Room')) {
            console.log('SUCCESS: Room created and listed!');
        } else {
            console.log('FAILURE: Room not found in list!');
        }

        console.log('Doing final health check...');
        const healthRes = await get('/', null);
        console.log('Final Health Check:', healthRes.status, healthRes.data);
    } catch (error) {
        console.error('Test failed:', error);
    }
}

test();
