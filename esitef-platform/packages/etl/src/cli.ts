async function main() {
  const cmd = process.argv[2];

  switch (cmd) {
    case "extract": {
      const { extractFromWordPress } = await import("./extract");
      await extractFromWordPress();
      break;
    }
    case "load": {
      const { loadIntoPostgres } = await import("./load");
      await loadIntoPostgres();
      break;
    }
    case "reconcile": {
      const { reconcileMigration } = await import("./reconcile");
      await reconcileMigration();
      break;
    }
    default:
      console.log("Usage: etl <extract|load|reconcile>");
      process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
