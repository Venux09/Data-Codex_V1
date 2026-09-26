/* ================================================================
   DATA INTELLIGENCE CODEX — CONTENT
   ----------------------------------------------------------------
   Everything you'd ever want to edit lives in this one file.
   app.js only ever reads from these objects — you never need to
   touch app.js or styles.css just to add or change content.
   ================================================================ */

/* ----------------------------------------------------------------
   HOW TO ADD A NEW DATASET
   ----------------------------------------------------------------
   1. Copy one of the objects in the DATASETS array below (or start
      from the commented shape if the array is empty).
   2. Give it a unique "id" — used in the URL, e.g. #/dataset/my-id.
   3. Fill in title, description, category, tools, status, year.
   4. Fill "overview" and "objective" as plain strings.
   5. Add as many "cleaningSteps" as you did — each is a
      { title, why, code, lang } object. "code" is optional.
   6. Add as many "analysis" entries as you want — each is a
      { question, approach, code, lang, result, insight } object.
      "code" and "result" are optional.
   7. Save the file. The Datasets grid and this dataset's detail
      page update automatically — nothing else needs to change.
   ML_PROJECTS and AI_PROJECTS follow the same idea — see the
   comments above each.
------------------------------------------------------------------- */

const DATASETS = [
   // {
   //   id: "unique-id",
   //   title: "",
   //   description: "",
   //   category: "",       // e.g. "DATA SCIENCE / EDA"
   //   tools: [],           // e.g. ["Python","Pandas","Matplotlib"]
   //   status: "complete" | "in-progress",
   //   year: "2026",
   //   overview: "",
   //   objective: "",
   //   cleaningSteps: [ { title, why, code, lang } ],
   //   analysis: [ { question, approach, code, lang, result, insight } ]
   // }
   {
      id: "us-real-estate-market-analysis",
      title: "U.S. Real Estate Price & Market Activity Analysis",
      description: "Analyzing 2M+ U.S. property listings to find where the market prices highest and lowest, and which states actually have the most active resale markets — not just the ones with the highest raw percentages.",
      category: "Data Science / EDA",
      tools: ["Python", "Pandas", "NumPy", "Matplotlib", "Seaborn", "SymPy"],
      status: "in-progress",
      year: "2026",
      overview: "A public real-estate listings export covering roughly 2 million U.S. properties across 12 columns — status, price, bedrooms, bathrooms, lot size, house size, city/state/zip, and prior sale date. The full file was too large to explore interactively, so work started from a reproducible 100,000-row random sample (seeded) rather than the full dataset.",
      objective: "Real estate prices vary enormously by location and property spec, but it's not obvious how much of that variance comes from geography versus size versus bedroom count — or which states genuinely have the most active resale markets versus states where a handful of listings can swing the numbers.",
      cleaningSteps: [
         {
            title: "Sampling 100,000 rows from a 2M+ row source file",
            why: "The full listings file was too large to explore interactively. Took a reproducible random sample (fixed random_state) rather than, say, the most recent listings only, so the sample wouldn't be biased toward any one time period or region.",
            lang: "python",
            code: "U_S_A_ESTATE = REAL_ESTATE_DATA.sample(n=100_000, random_state=42)"
         },
         {
            title: "Rows missing bed, bath, house_size, and prev_sold_date all at once",
            why: "Rows with all four of these fields empty looked like effectively unlisted records rather than partial data worth salvaging, so they were identified as a group (not column-by-column) and dropped together.",
            lang: "python",
            code: "common_na = USA_ESTATE[USA_ESTATE[['bed','bath','house_size','prev_sold_date']].isna().all(axis=1)]\nUSA_ESTATE = USA_ESTATE.drop(index=common_na.index)"
         },
         {
            title: "Missing price values",
            why: "Price is the target variable for nearly every question asked of this data. A missing price can't be reasonably imputed without effectively guessing the answer to the analysis itself, so those rows were dropped rather than filled.",
            lang: "python",
            code: "USA_ESTATE = USA_ESTATE.dropna(subset=[\"price\"])"
         },
         {
            title: "Missing zip_code or city",
            why: "Without a location key, a row can't be grouped into any of the location-based comparisons (median by city, activity by state), so it can't be meaningfully imputed either — dropped.",
            lang: "python",
            code: "USA_ESTATE.dropna(subset=[\"zip_code\", \"city\"], inplace=True)"
         },
         {
            title: "Remaining missing bed / bath / acre_lot / house_size",
            why: "Rather than drop more rows from an already-sampled dataset, or fill with one global median, filled each field using the median for that property's own zip code — two properties in the same zip code are far more comparable than the dataset-wide average.",
            lang: "python",
            code: "for col in ['bed','bath','acre_lot','house_size']:\n    Estate_data[col] = Estate_data.groupby('zip_code')[col].transform(lambda x: x.fillna(x.median()))"
         },
         {
            title: "Near-zero dollar prices distorting a 'cheapest cities' ranking",
            why: "While ranking cities by median price, a handful of listings at $0 surfaced at the bottom — clearly data-entry artifacts, not real prices. Filtered these out before ranking so the 'cheapest' list would reflect real listings.",
            lang: "python",
            code: "Estate_Data = Estate_Data[Estate_Data['price'] > 1000]"
         }
      ],
      analysis: [
         {
            question: "Which cities have the highest and lowest median home prices?",
            approach: "Grouped by city and used the median rather than the mean, so a single ultra-high-value estate couldn't distort what a 'typical' price looks like in that city.",
            lang: "python",
            code: "top_10_cities = Estate_Data.groupby('city')['price'].median().sort_values(ascending=False).head(10)\nlow_10_cities = Estate_Data.groupby('city')['price'].median().sort_values(ascending=True).head(10)",
            result: "Aspen led at a $49.5M median, with Gulf Stream and Pebble Beach close behind. The cheapest median cities sat in the $1,500–$7,000 range.",
            insight: "The spread across cities spans several orders of magnitude, which meant later cross-city comparisons — like price per square foot — needed to control for location rather than treat the market as one pool."
         },
         {
            question: "What does a typical price-per-square-foot look like across the market?",
            approach: "Computed price divided by house size for each listing, then took the median across the dataset, consistent with the skew already visible in city-level prices.",
            lang: "python",
            code: "Estate_Data['price_per_sqft'] = Estate_Data['price'] / Estate_Data['house_size']\nMedian_psft = math.ceil(Estate_Data['price_per_sqft'].median())",
            result: "The market median came out to $183 per square foot.",
            insight: "That figure becomes a usable yardstick going forward — e.g. flagging listings priced well above or below $183/sqft for their size as candidates worth a closer look."
         },
         {
            question: "How does price scale with bedroom count?",
            approach: "Grouped by bed count and looked at median price alongside median house size together, since price should track size at least as much as bedroom count.",
            lang: "python",
            code: "bed_increase = Estate_Data.groupby('bed')[['price','house_size']].median().sort_index()",
            result: "Price and house size mostly rose together up to 6 bedrooms, but half-bedroom counts (1.5, 2.5, 3.5...) consistently showed lower prices than the whole-number bracket just below them despite similar or larger sizes.",
            insight: "Bedroom count alone isn't a clean price driver — half-bedroom listings behave differently and are worth separating out before using bed count as a feature in any future pricing model."
         },
         {
            question: "Which states have the most active resale markets?",
            approach: "Calculated what percentage of each state's listings were for-sale vs. sold vs. ready-to-build, normalized within each state so states with very different total listing counts could still be compared fairly.",
            lang: "python",
            code: "market_percentage = Estate_Data.groupby('state')['status'].value_counts(normalize=True) * 100\nactive_market = market_percentage.loc[:, 'for_sale'].sort_values(ascending=False)",
            result: "The first pass put Guam, Alaska, North Dakota, and Vermont at a 100% for-sale rate.",
            insight: "That result turned out to be a bias flag rather than a finding — several of those states had very few total listings, so one or two properties could swing the percentage to 100%. The ranking needed a minimum sample size before it meant anything."
         },
         {
            question: "After correcting for that bias, which states really lead in active market share?",
            approach: "Re-ran the same percentage calculation but excluded any state with fewer than 100 total listings, so no state could top the ranking on the strength of a handful of properties.",
            lang: "python",
            code: "state_summary = Estate_Data.groupby('state')['status'].agg(\n    total_listing='count',\n    percentage_for_sale=lambda s: (s == 'for_sale').mean() * 100\n)\nreliable_market = state_summary[state_summary['total_listing'] >= 100]\nactive_reliable_market = reliable_market.sort_values(by='percentage_for_sale', ascending=False).head(10)",
            result: "Vermont and North Dakota still led at 100%, but now backed by 112 and 151 listings respectively — with Wyoming, Maine, and Connecticut close behind.",
            insight: "Checking whether a striking groupby result survives a minimum-sample-size filter is worth doing by default. The first version of this answer would have quietly misled anyone who took it at face value."
         }
      ]
   }
];

/* ----------------------------------------------------------------
   HOW TO ADD A NEW ML PROJECT
   ----------------------------------------------------------------
   Each entry needs: id, title, description, category, tools,
   status, year, problem, datasetNote, preprocessing[],
   modelChoice { model, why }, evaluation { metric, result,
   interpretation }, futureWork. preprocessing[] follows the same
   { title, why, code, lang } shape used in cleaningSteps above.
------------------------------------------------------------------- */
const ML_PROJECTS = [
   // Add ML project objects here — see comment above.
];

/* ----------------------------------------------------------------
   HOW TO ADD A NEW AI ENGINEERING PROJECT
   ----------------------------------------------------------------
   Same idea again: id, title, description, category, tools,
   status, year, problem, architecture[] (same { title, why, code,
   lang } shape), evaluation (plain string), futureWork.
------------------------------------------------------------------- */
const AI_PROJECTS = [
   // Add AI Engineering project objects here once ready.
];

const SOCIAL_LINKS = [
   // { label: "", sub: "", href: "", icon: "github" | "linkedin" }
];

const NOW_LEARNING = [
   // { title: "", note: "" }
];

const ABOUT_CONTENT = {
   // sections: [ { heading: "", body: "" } ]
   sections: []
};