const mealsEl = document.getElementById("meals");
const favoriteContanier = document.getElementById("fav-meals");

const searchTerm = document.getElementById("search-term");
const searchBtn = document.getElementById("search");

const mealPopup = document.getElementById("meal-popup");
const mealInfoEl = document.getElementById("meal-info");
const popCloseBtn = document.getElementById("close-popup");

getRandomMeal();

fetchFavMeals();

async function getRandomMeal() {
  const res = await fetch("https://www.themealdb.com/api/json/v1/1/random.php");

  const RandomMeal = await res.json();

  const final = RandomMeal.meals[0];

  addMeal(final, true);
}

async function getRandomMealById(id) {
  const resp = await fetch(
    `https://www.themealdb.com/api/json/v1/1/lookup.php?i=${id}`
  );

  const idmeal = await resp.json();

  const final = idmeal.meals[0];

  return final;
}

async function getMealBySearch(term) {
  const res = await fetch(
    `https://www.themealdb.com/api/json/v1/1/search.php?s=${term}`
  );

  const resp = await res.json();
  const meals = resp.meals;

  return meals;
}

function addMeal(mealData, random = false) {
  const meal = document.createElement("div");
  meal.classList.add("meal");

  meal.innerHTML = `

    <div class="meal-head">
      <img src=${mealData.strMealThumb} alt="" />
    </div>
    <div class="meal-body">
      <h4>${mealData.strMeal}</h4>
      <button class="fav-btn">
        <i class="fa-regular fa-heart"></i>
      </button>
    </div>

    `;

  const btn = meal.querySelector(".meal-body .fav-btn");

  btn.addEventListener("click", (e) => {
    if (btn.classList.contains("active")) {
      removeMealFromLS(mealData.idMeal);
      btn.classList.remove("active");
    } else {
      addMealLocalStorage(mealData.idMeal);
      btn.classList.add("active");
    }

    fetchFavMeals();
  });

  meal.addEventListener("click", () => {
    updateMealInfo(mealData);
  });

  mealsEl.appendChild(meal);
}

function updateMealInfo(mealData) {
  mealInfoEl.innerHTML = " ";
  const mealEl = document.createElement("div");

  const ingredients = [];

  for (let i = 1; i <= 20; i++) {
    if (mealData["strIngredient" + i]) {
      ingredients.push(
        `${mealData["strIngredient" + i]} - ${mealData["strMeasure" + i]}`
      );
    } else {
      break;
    }
  }

  mealEl.innerHTML = `
   <h1>${mealData.strMeal}</h1>
   <img src=${mealData.strMealThumb}  />
   <p>
     ${mealData.strInstructions}
   </p>
   <h3>Ingredients:</h3>
        <ul>
            ${ingredients
              .map(
                (ing) => `
            <li>${ing}</li>
            `
              )
              .join("")}
        </ul>
   `;

  mealInfoEl.appendChild(mealEl);

  mealPopup.classList.remove("hidden");
}

function addMealLocalStorage(mealId) {
  const mealIds = getMealFromLS();

  localStorage.setItem("mealIds", JSON.stringify([...mealIds, mealId]));
}

function getMealFromLS() {
  const mealIds = JSON.parse(localStorage.getItem("mealIds"));

  return mealIds === null ? [] : mealIds;
}

function removeMealFromLS(mealId) {
  const mealIds = getMealFromLS();

  localStorage.setItem(
    "mealIds",
    JSON.stringify(mealIds.filter((id) => id !== mealId))
  );
}

async function fetchFavMeals() {
  favoriteContanier.innerHTML = " ";

  const mealIds = getMealFromLS();

  for (let i = 0; i < mealIds.length; i++) {
    const mealId = mealIds[i];

    try {
      let meal = await getRandomMealById(mealId);
      addMealToFav(meal);
    } catch (error) {
      console.log(error);
    }
  }
}

function addMealToFav(mealData) {
  const favmeal = document.createElement("li");

  favmeal.innerHTML = `
       <img 
         src=${mealData.strMealThumb} alt=${mealData.strMeal} /><span>${mealData.strMeal}</span>
         <button class="clear" ><i class="fa-solid fa-rectangle-xmark"></i></button>
     
    `;

  const btn = favmeal.querySelector(".clear");

  btn.addEventListener("click", () => {
    removeMealFromLS(mealData.idMeal);
    fetchFavMeals();
  });

  favmeal.addEventListener("click", () => {
    updateMealInfo(mealData);
  });

  favoriteContanier.append(favmeal);
}

searchBtn.addEventListener("click", async () => {
  mealsEl.innerHTML = " ";
  const search = searchTerm.value;

  const meals = await getMealBySearch(search);

  if (meals) {
    meals.forEach((meal) => {
      addMeal(meal);
    });
  }
});

popCloseBtn.addEventListener("click", () => {
  mealPopup.classList.add("hidden");
});
