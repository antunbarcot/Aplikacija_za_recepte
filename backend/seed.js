import { db } from "./src/config/db.js"; 
import { 
  categoriesTable, 
  areasTable, 
  recipesTable, 
  ingredientsTable, 
  recipeIngredientsTable 
} from "./src/db/schema.js";
import { eq } from "drizzle-orm";

async function seed() {
  console.log("🚀 Započinjem napredno punjenje baze podataka (6 tablica)...");

  try {
    const odabraneKategorije = ["Chicken", "Beef", "Dessert", "Seafood"];

    const uneseneRegije = {};
    const uneseniSastojci = {};

    for (const katName of odabraneKategorije) {
      const thumbnail_url = `https://www.themealdb.com/images/category/${katName}.png`;
      const [novaKategorija] = await db
        .insert(categoriesTable)
        .values({ name: katName, thumbnail: thumbnail_url })
        .onConflictDoNothing({ target: categoriesTable.name })
        .returning();

      let categoryId = novaKategorija?.id;
      if (!categoryId) {
        const [postojeca] = await db.select().from(categoriesTable).where(eq(categoriesTable.name, katName));
        categoryId = postojeca.id;
      }

      console.log(`📂 Obrađujem kategoriju: ${katName} (ID u našoj bazi: ${categoryId})`);

      const listaOdgovor = await fetch(`https://www.themealdb.com/api/json/v1/1/filter.php?c=${katName}`);
      const listaPodaci = await listaOdgovor.json();

      const jela = listaPodaci.meals.slice(0, 10);

      for (const jelo of jela) {
        const detaljiOdgovor = await fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${jelo.idMeal}`);
        const detaljiPodaci = await detaljiOdgovor.json();
        const m = detaljiPodaci.meals[0];

        if (!m) continue;

        let areaId = null;
        if (m.strArea) {
          if (!uneseneRegije[m.strArea]) {
            const [novaRegija] = await db
              .insert(areasTable)
              .values({ name: m.strArea })
              .onConflictDoNothing({ target: areasTable.name })
              .returning();

            if (novaRegija) {
              uneseneRegije[m.strArea] = novaRegija.id;
            } else {
              const [postojeca] = await db.select().from(areasTable).where(eq(areasTable.name, m.strArea));
              uneseneRegije[m.strArea] = postojeca.id;
            }
          }
          areaId = uneseneRegije[m.strArea];
        }

        await db.insert(recipesTable).values({
          id: m.idMeal,
          title: m.strMeal,
          instructions: m.strInstructions,
          image: m.strMealThumb,
          cookTime: `${Math.floor(Math.random() * 30) + 20} min`,
          servings: `${Math.floor(Math.random() * 3) + 2}`,
          categoryId: categoryId,
          areaId: areaId
        }).onConflictDoNothing();

        console.log(`   - Spremljen recept: ${m.strMeal}`);

        for (let i = 1; i <= 20; i++) {
          const sastojakNaziv = m[`strIngredient${i}`]?.trim();
          const kolicina = m[`strMeasure${i}`]?.trim();

          if (!sastojakNaziv || sastojakNaziv === "") break;

          let ingredientId = null;

          if (!uneseniSastojci[sastojakNaziv]) {
            const [noviSastojak] = await db
              .insert(ingredientsTable)
              .values({ name: sastojakNaziv })
              .onConflictDoNothing({ target: ingredientsTable.name })
              .returning();

            if (noviSastojak) {
              uneseniSastojci[sastojakNaziv] = noviSastojak.id;
            } else {
              const [postojeci] = await db.select().from(ingredientsTable).where(eq(ingredientsTable.name, sastojakNaziv));
              uneseniSastojci[sastojakNaziv] = postojeci.id;
            }
          }
          ingredientId = uneseniSastojci[sastojakNaziv];

          if (ingredientId) {
            await db.insert(recipeIngredientsTable).values({
              recipeId: m.idMeal,
              ingredientId: ingredientId,
              measure: kolicina || "to taste"
            }).onConflictDoNothing();
          }
        }
      }
    }

    console.log("✅ ČESTITAMO! Tvoja baza podataka je uspješno normalizirana i napunjena!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Greška tijekom izvršavanja seed skripte:", error);
    process.exit(1);
  }
}

seed();