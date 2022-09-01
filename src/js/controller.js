import * as model from './model.js';
import { MODAL_CLOSE_SEC } from './config.js';
import recipeView from './views/recipeView.js';
import searchView from './views/searchView.js';
import resultsView from './views/resultsView.js';
import paginationView from './views/paginationView.js';
import bookmarksView from './views/bookmarksView.js';
import addRecipeView from './views/addRecipeView.js';

import 'core-js/stable';
import 'regenerator-runtime/runtime';
import { async } from 'regenerator-runtime';

if (module.hot) {
  module.hot.accept();
}

const controlRecipes = async function () {
  try {
    const id = window.location.hash.slice(1);

    if (!id) return;
    recipeView.renderSpinner();

    // 0) highlight selected search result
    resultsView.update(model.getSearchResultsPage());
    bookmarksView.update(model.state.bookmarks);

    // 1) loading recipe
    await model.loadRecipe(id);

    // 2) rendering recipe
    recipeView.render(model.state.recipe);
  } catch (err) {
    recipeView.renderError();
    console.error(err);
  }
};

const controlSearchResults = async function () {
  try {
    // 1) get search query
    const query = searchView.getQuery();
    if (!query) return;

    resultsView.renderSpinner();

    // 2) load search results
    await model.loadSearchResults(query);

    // 3) render search results
    // resultsView.render(model.state.search.results);
    resultsView.render(model.getSearchResultsPage(1));

    // 4) render pagination
    paginationView.render(model.state.search);
  } catch (err) {
    paginationView.renderError(err.message);
    console.error(err);
  }
};

const controlPagination = function (goToPage) {
  // 1) render NEW search results
  resultsView.render(model.getSearchResultsPage(goToPage));

  // 2) render NEW pagination
  paginationView.render(model.state.search);
};

const controlServings = function (newServings) {
  // update ingredients
  model.updateServings(newServings);

  // render UPDATED recipe
  recipeView.update(model.state.recipe);
};

const controlAddBookmark = function () {
  // render bookmarks

  // add bookmarks to state
  if (model.state.recipe.bookmarked)
    model.deleteBookmark(model.state.recipe.id);
  // remove bookmarks fro stat
  else model.addBookmark(model.state.recipe);

  // update bookmark icon
  recipeView.update(model.state.recipe);

  // render bookmarks to bookmarksView
  bookmarksView.render(model.state.bookmarks);
};

const controlBookmarks = function () {
  bookmarksView.render(model.state.bookmarks);
};

const controlAddRecipe = async function (newRecipe) {
  try {
    // show loading spinner
    addRecipeView.renderSpinner();

    // upload new recipe data
    await model.uploadRecipe(newRecipe);
    console.log(model.state.recipe);

    // display success message
    addRecipeView.renderMessage();

    // load new recipe
    recipeView.render(model.state.recipe);

    // Render bookmarks view
    bookmarksView.render(model.state.bookmarks);

    // update ID URL
    window.history.pushState(null, '', `#${model.state.recipe.id}`);

    // close modal window & reload form
    setTimeout(function () {
      addRecipeView._toggleWindow();
    }, MODAL_CLOSE_SEC * 1000);
  } catch (err) {
    console.error('💥', err);
    addRecipeView.renderError(err.message);
  }
};

const init = function () {
  bookmarksView.addHandlerRender(controlBookmarks);
  recipeView.addHandlerRender(controlRecipes);
  recipeView.addHandlerUpdateServings(controlServings);
  recipeView.addHandlerAddBookmark(controlAddBookmark);
  searchView.addHandlerSearch(controlSearchResults);
  paginationView.addHandlerClick(controlPagination);
  addRecipeView.addHandlerUpload(controlAddRecipe);
};
init();
