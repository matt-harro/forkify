import icons from 'url:../../img/icons.svg';
import PreviewView from './previewView';

class ResultsView extends PreviewView {
  _parentElement = document.querySelector('.results');
  _errorMessage = 'No recipes found for your query. Please try another one!';
  _message = '';
}

export default new ResultsView();
