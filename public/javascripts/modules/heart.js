import axios from 'axios';
import { $ } from './bling';

function ajaxHeart(e) {
	e.preventDefault();
	console.log('HEART ITTT!!!!!!!!!!');
	console.log(this);
	axios
		.post(this.action)
		.then(res => {
			// toggle the heart button to automatically change red or white without page refresh
			const isHearted = this.heart.classList.toggle('heart__button--hearted');
			$('.heart-count').textContent = res.data.hearts.length;
			// if a heart is clicked for hearting, animate a floated heart
			if(isHearted) {
				this.heart.classList.add('heart__button--float');
				setTimeout(() => this.heart.classList.remove('heart__button--float'), 2500);
			}
		})
		.catch(console.error);
}

export default ajaxHeart;