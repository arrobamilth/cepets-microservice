const { initializeDatabase, getDatabaseUrl, getPool } = require('../packages/shared/src');

initializeDatabase()
  .then(async () => {
    console.log(
      JSON.stringify(
        {
          ok: true,
          databaseUrl: getDatabaseUrl(),
          initializedAt: new Date().toISOString()
        },
        null,
        2
      )
    );

    await getPool().end();
  })
  .catch(async (error) => {
    console.error(error.message);

    try {
      await getPool().end();
    } catch (closeError) {
      // ignore shutdown errors
    }

    process.exit(1);
  });
