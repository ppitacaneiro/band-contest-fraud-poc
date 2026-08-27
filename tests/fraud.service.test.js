require('dotenv').config();

const db = require('../src/config/database');
const fraudService = require('../src/modules/fraud/fraud.service');

describe('Fraud Service', () => {

    const TEST_PREFIX = 'fraud-test-';

    let contestId;
    let artistId;

    beforeAll(async () => {

        // Concurso de pruebas
        const [contest] = await db.execute(
            `
            INSERT INTO contests (name)
            VALUES (?)
            `,
            [`${TEST_PREFIX}contest`]
        );

        contestId = contest.insertId;

        // Artista de pruebas
        const [artist] = await db.execute(
            `
            INSERT INTO artists (name)
            VALUES (?)
            `,
            [`${TEST_PREFIX}artist`]
        );

        artistId = artist.insertId;
    });

    beforeEach(async () => {

        await db.execute(
            `
            DELETE FROM vote_attempts
            WHERE contest_id = ?
            `,
            [contestId]
        );

        await db.execute(
            `
            DELETE FROM votes
            WHERE contest_id = ?
            `,
            [contestId]
        );
    });

    afterAll(async () => {

        // Eliminamos los datos creados durante las pruebas

        await db.execute(
            `
            DELETE FROM vote_attempts
            WHERE contest_id = ?
            `,
            [contestId]
        );

        await db.execute(
            `
            DELETE FROM votes
            WHERE contest_id = ?
            `,
            [contestId]
        );

        await db.execute(
            `
            DELETE FROM users
            WHERE email LIKE ?
            `,
            [`${TEST_PREFIX}%`]
        );

        await db.execute(
            `
            DELETE FROM artists
            WHERE id = ?
            `,
            [artistId]
        );

        await db.execute(
            `
            DELETE FROM contests
            WHERE id = ?
            `,
            [contestId]
        );

        await db.end();
    });


    async function createUser({
        fingerprintId = null
    } = {}) {

        const email =
            `${TEST_PREFIX}${Date.now()}-${Math.random()}@test.local`;

        const [result] = await db.execute(
            `
            INSERT INTO users (
                email,
                fingerprint_id
            )
            VALUES (?, ?)
            `,
            [
                email,
                fingerprintId
            ]
        );

        return result.insertId;
    }


    async function createAttempt({
        userId,
        ipAddress = '80.100.50.10',
        artist = artistId,
        createdAt = null
    }) {

        if (createdAt) {

            await db.execute(
                `
                INSERT INTO vote_attempts (
                    user_id,
                    contest_id,
                    artist_id,
                    ip_address,
                    user_agent,
                    status,
                    risk_score,
                    created_at
                )
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                `,
                [
                    userId,
                    contestId,
                    artist,
                    ipAddress,
                    'test-agent',
                    'accepted',
                    0,
                    createdAt
                ]
            );

        } else {

            await db.execute(
                `
                INSERT INTO vote_attempts (
                    user_id,
                    contest_id,
                    artist_id,
                    ip_address,
                    user_agent,
                    status,
                    risk_score
                )
                VALUES (?, ?, ?, ?, ?, ?, ?)
                `,
                [
                    userId,
                    contestId,
                    artist,
                    ipAddress,
                    'test-agent',
                    'accepted',
                    0
                ]
            );
        }
    }

    async function createVote({
        userId,
        fingerprintId
    }) {

        await db.execute(
            `
            UPDATE users
            SET fingerprint_id = ?
            WHERE id = ?
            `,
            [
                fingerprintId,
                userId
            ]
        );

        await db.execute(
            `
            INSERT INTO votes (
                user_id,
                contest_id,
                artist_id
            )
            VALUES (?, ?, ?)
            `,
            [
                userId,
                contestId,
                artistId
            ]
        );
    }


    test('1. should accept a clean vote', async () => {

        const userId = await createUser();

        const result = await fraudService.analyzeVote({
            userId,
            ipAddress: '80.100.50.1',
            contestId,
            artistId,
            fingerprintId: 'unique-fingerprint-1'
        });

        expect(result.riskScore).toBe(0);
        expect(result.status).toBe('accepted');
    });


    test('2. should not trigger IP rule with 4 different users', async () => {

        for (let i = 0; i < 4; i++) {

            const userId = await createUser();

            await createAttempt({
                userId,
                ipAddress: '80.100.50.2'
            });
        }

        const userId = await createUser();

        const result = await fraudService.analyzeVote({
            userId,
            ipAddress: '80.100.50.2',
            contestId,
            artistId,
            fingerprintId: 'unique-ip-test'
        });

        expect(result.riskScore).toBe(0);
    });


    test('3. should trigger IP rule with 5 different users', async () => {

        for (let i = 0; i < 5; i++) {

            const userId = await createUser();

            await createAttempt({
                userId,
                ipAddress: '80.100.50.3'
            });
        }

        const userId = await createUser();

        const result = await fraudService.analyzeVote({
            userId,
            ipAddress: '80.100.50.3',
            contestId,
            artistId,
            fingerprintId: 'unique-ip-test-2'
        });

        expect(result.riskScore).toBe(40);

        const rule = result.rules.find(
            rule => rule.name === 'multiple_users_same_ip'
        );

        expect(rule.triggered).toBe(true);
        expect(rule.score).toBe(40);
    });


    test('4. should not trigger rapid votes with 9 attempts', async () => {

        for (let i = 0; i < 9; i++) {

            const userId = await createUser();

            await createAttempt({
                userId,
                ipAddress: `80.100.60.${i + 1}`
            });
        }

        const userId = await createUser();

        const result = await fraudService.analyzeVote({
            userId,
            ipAddress: '80.100.60.20',
            contestId,
            artistId,
            fingerprintId: 'rapid-test-1'
        });

        const rule = result.rules.find(
            rule => rule.name === 'rapid_votes_same_artist'
        );

        expect(rule.triggered).toBe(false);
        expect(rule.score).toBe(0);
    });


    test('5. should trigger rapid votes with 10 attempts', async () => {

        for (let i = 0; i < 10; i++) {

            const userId = await createUser();

            await createAttempt({
                userId,
                ipAddress: `80.100.70.${i + 1}`
            });
        }

        const userId = await createUser();

        const result = await fraudService.analyzeVote({
            userId,
            ipAddress: '80.100.70.20',
            contestId,
            artistId,
            fingerprintId: 'rapid-test-2'
        });

        const rule = result.rules.find(
            rule => rule.name === 'rapid_votes_same_artist'
        );

        expect(rule.triggered).toBe(true);
        expect(rule.score).toBe(30);
        expect(result.riskScore).toBe(30);
    });


    test('6. should not trigger fingerprint rule when fingerprint is unique', async () => {

        const userId = await createUser();

        const result = await fraudService.analyzeVote({
            userId,
            ipAddress: '80.100.80.1',
            contestId,
            artistId,
            fingerprintId: 'fingerprint-unique'
        });

        const rule = result.rules.find(
            rule => rule.name === 'same_fingerprint'
        );

        expect(rule.triggered).toBe(false);
        expect(rule.score).toBe(0);
    });


    test('7. should trigger fingerprint rule when another user already voted with same fingerprint', async () => {

        const fingerprint = 'fingerprint-shared';

        const previousUser = await createUser({
            fingerprintId: fingerprint
        });

        await createVote({
            userId: previousUser,
            fingerprintId: fingerprint
        });

        const newUser = await createUser({
            fingerprintId: fingerprint
        });

        const result = await fraudService.analyzeVote({
            userId: newUser,
            ipAddress: '80.100.90.1',
            contestId,
            artistId,
            fingerprintId: fingerprint
        });

        const rule = result.rules.find(
            rule => rule.name === 'same_fingerprint'
        );

        expect(rule.triggered).toBe(true);
        expect(rule.score).toBe(40);
        expect(result.riskScore).toBe(40);
    });


    test('8. should accumulate IP + rapid votes', async () => {

        for (let i = 0; i < 10; i++) {

            const userId = await createUser();

            await createAttempt({
                userId,
                ipAddress: '80.100.100.1'
            });
        }

        const userId = await createUser();

        const result = await fraudService.analyzeVote({
            userId,
            ipAddress: '80.100.100.1',
            contestId,
            artistId,
            fingerprintId: 'combined-test-1'
        });

        expect(result.riskScore).toBe(70);

        expect(
            result.rules.find(
                rule => rule.name === 'multiple_users_same_ip'
            ).score
        ).toBe(40);

        expect(
            result.rules.find(
                rule => rule.name === 'rapid_votes_same_artist'
            ).score
        ).toBe(30);
    });


    test('9. should accumulate IP + fingerprint', async () => {

        const fingerprint = 'combined-fingerprint';

        const previousUser = await createUser({
            fingerprintId: fingerprint
        });

        await createVote({
            userId: previousUser,
            fingerprintId: fingerprint
        });

        for (let i = 0; i < 5; i++) {

            const userId = await createUser();

            await createAttempt({
                userId,
                ipAddress: '80.100.110.1'
            });
        }

        const userId = await createUser({
            fingerprintId: fingerprint
        });

        const result = await fraudService.analyzeVote({
            userId,
            ipAddress: '80.100.110.1',
            contestId,
            artistId,
            fingerprintId: fingerprint
        });

        expect(result.riskScore).toBe(80);
    });


    test('10. should accumulate all three rules', async () => {

        const fingerprint = 'all-rules-fingerprint';

        const previousUser = await createUser({
            fingerprintId: fingerprint
        });

        await createVote({
            userId: previousUser,
            fingerprintId: fingerprint
        });

        for (let i = 0; i < 10; i++) {

            const userId = await createUser();

            await createAttempt({
                userId,
                ipAddress: '80.100.120.1'
            });
        }

        const userId = await createUser({
            fingerprintId: fingerprint
        });

        const result = await fraudService.analyzeVote({
            userId,
            ipAddress: '80.100.120.1',
            contestId,
            artistId,
            fingerprintId: fingerprint
        });

        expect(result.riskScore).toBe(110);

        expect(result.rules).toHaveLength(3);

        expect(
            result.rules.every(rule => rule.triggered)
        ).toBe(true);
    });


    test('11. should ignore attempts older than 5 minutes for IP rule', async () => {

        const oldDate =
            new Date(Date.now() - 10 * 60 * 1000);

        for (let i = 0; i < 5; i++) {

            const userId = await createUser();

            await createAttempt({
                userId,
                ipAddress: '80.100.130.1',
                createdAt: oldDate
            });
        }

        const userId = await createUser();

        const result = await fraudService.analyzeVote({
            userId,
            ipAddress: '80.100.130.1',
            contestId,
            artistId,
            fingerprintId: 'old-test'
        });

        const rule = result.rules.find(
            rule => rule.name === 'multiple_users_same_ip'
        );

        expect(rule.triggered).toBe(false);
        expect(rule.score).toBe(0);
    });


    test('12. should count the same user only once for IP rule', async () => {

        const userId = await createUser();

        for (let i = 0; i < 10; i++) {

            await createAttempt({
                userId,
                ipAddress: '80.100.140.1'
            });
        }

        const result = await fraudService.analyzeVote({
            userId,
            ipAddress: '80.100.140.1',
            contestId,
            artistId,
            fingerprintId: 'same-user-test'
        });

        const rule = result.rules.find(
            rule => rule.name === 'multiple_users_same_ip'
        );

        expect(rule.data.distinctUsers).toBe(1);
        expect(rule.triggered).toBe(false);
        expect(rule.score).toBe(0);
    });
});