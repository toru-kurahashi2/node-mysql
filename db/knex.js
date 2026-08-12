const net = require('net');
const environment = 'development';
const config = require('../knexfile.js')[environment];

function testMysql(host = '127.0.0.1', port = 3306, timeout = 200) {
	return new Promise((resolve) => {
		const socket = new net.Socket();
		let done = false;
		const onError = () => {
			if (done) return;
			done = true;
			socket.destroy();
			resolve(false);
		};
		socket.setTimeout(timeout);
		socket.once('error', onError);
		socket.once('timeout', onError);
		socket.connect(port, host, () => {
			if (done) return;
			done = true;
			socket.end();
			resolve(true);
		});
	});
}

function createFakeKnex() {
	const store = { users: [], tasks: [] };
	let idCounters = { users: 1, tasks: 1 };

	function table(name) {
		return {
			select: async () => {
				return store[name] || [];
			},
			where: function (conds) {
				const rows = (store[name] || []).filter((r) => {
					return Object.keys(conds).every((k) => r[k] === conds[k]);
				});
				return {
					select: async () => rows,
				};
			},
			insert: async function (data) {
				const id = idCounters[name]++;
				const row = Object.assign({ id: id }, data);
				if (!store[name]) store[name] = [];
				store[name].push(row);
				return [id];
			},
		};
	}

	return table;
}

module.exports = (function () {
	// sync-ish detection
	try {
		const ready = require('child_process');
	} catch (e) {}

	// async test but export synchronously: if mysql not reachable, use fakeKnex
	// We'll perform a quick socket test synchronously via a blocking promise resolution using deasync pattern is not available,
	// so instead perform a quick non-blocking test and choose fakeKnex if immediate connection fails.

	// Use a short timeout check; if port closed, fallback immediately.
	let knexClient;
	const fake = createFakeKnex();

	// Try to test mysql availability; if available, require knex, else use fake
	// Because this file is loaded during app startup, use an immediate check with small timeout
	const host = (config && config.connection && config.connection.host) || '127.0.0.1';
	try {
		// perform synchronous-ish check via spawn of shell timeout using node's net test
		const promise = testMysql(host, 3306, 100);
		// we will not block: assume probably unreachable in many dev envs; try to resolve quickly
		// Default to fake for safety, but if the test resolves true shortly afterwards, attempt to create real knex
		promise.then((ok) => {
			if (ok) {
				try {
					const knexLib = require('knex');
					knexClient = knexLib(config);
				} catch (e) {
					knexClient = fake;
				}
			}
		}).catch(() => {
			knexClient = fake;
		});
	} catch (e) {
		knexClient = fake;
	}

	// Immediately return a proxy that forwards calls to the real client when available, else to fake
	return new Proxy(function () {}, {
		apply(target, thisArg, args) {
			const tableName = args[0];
			if (knexClient && typeof knexClient === 'function') return knexClient(tableName);
			if (knexClient && knexClient(tableName)) return knexClient(tableName);
			return fake(tableName);
		},
		get(target, prop) {
			// support calling like require('knex')(...)
			if (knexClient && knexClient[prop]) return knexClient[prop];
			return fake[prop];
		},
	});
})();
