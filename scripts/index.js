import {
  getCardList,
  getUserInfo,
  setUserInfo,
  setUserAvatar,
  addCard,
  deleteCard,
  changeLikeCardStatus,
} from "./components/api.js";

const popups = document.querySelectorAll(".popup");
const editProfilePopup = document.querySelector("#edit-profile-popup");
const addPopup = document.querySelector("#add-card-popup");
const cardInfoPopup = document.querySelector("#card-info-popup");

const editProfile = document.querySelector(".edit-profile"); //переменная открыть редактирование профиля
// const closeButton = popups.querySelector(".popup__close-button"); //переменная закрыть редактирование
const saveButton = document.querySelector(".popup__save-button"); //переменная кнопки сохранить
const userName = document.querySelector(".profile__user-name"); //переменная касса имени профиля на странице
const userJop = document.querySelector(".profile__user-jop"); //переменная касса работы на странице

const addButton = document.querySelector(".add-button"); //переменная кнопки добавить
const addCloseButton = addPopup.querySelector(".popup__close-button_add");
const addForm = addPopup.querySelector(".popup__form_add");

let nameInput = document.querySelector(".popup__user-name"); // Воспользуйтесь инструментом .querySelector()
let jobInput = document.querySelector(".popup__user-jop"); // Воспользуйтесь инструментом .querySelector()
let avatarInput = document.querySelector(".popup__user-avatar");

let cardNameInput = addPopup.querySelector(".popup__card-name");
let cardLinkInput = addPopup.querySelector(".popup__card-link");

function openEditProfilePopup() {
  editProfilePopup.classList.add("popup_opened");
  // Clear any previous errors
  const errorSpans = editProfilePopup.querySelectorAll(".popup__error");
  errorSpans.forEach(span => span.textContent = "");
}
function openAddCardPopup() {
  addPopup.classList.add("popup_opened");
  // Clear any previous errors
  const errorSpans = addPopup.querySelectorAll(".popup__error");
  errorSpans.forEach(span => span.textContent = "");
}

function closePopup() {
  editProfilePopup.classList.remove("popup_opened");
}

function closeAddPopup() {
  addPopup.classList.remove("popup_opened");
}
for (const popup of popups) {
  popup.querySelector(".popup__close-button").addEventListener("click", () => {
    popup.classList.remove("popup_opened");
  });
}

const setInputValidation = (inputElement) => {
  const form = inputElement.closest("form");
  const submitButton = form.querySelector('button[type="submit"]');
  const errorSpan = inputElement.nextElementSibling;

  const checkFormValidity = () => {
    const inputs = Array.from(form.querySelectorAll("input"));
    const isFormValid = inputs.every((input) => input.validity.valid);
    submitButton.disabled = !isFormValid;
    submitButton.style.opacity = isFormValid ? "1" : "0.5";
  };

  inputElement.addEventListener("input", () => {
    if (!inputElement.validity.valid) {
      inputElement.style.borderBottomColor = "red";
      errorSpan.textContent = inputElement.validationMessage;
    } else {
      inputElement.style.borderBottomColor = "rgba(0,0,0,0.2)";
      errorSpan.textContent = "";
    }
    checkFormValidity();
  });

  // Initial check
  checkFormValidity();
};

[nameInput, jobInput, avatarInput, cardNameInput, cardLinkInput].forEach(
  (input) => {
    if (input) {
      setInputValidation(input);
    }
  },
);

function fillProfileInputs() {
  nameInput.value = userName.textContent;
  jobInput.value = userJop.textContent;
  // Trigger validation after filling
  [nameInput, jobInput].forEach((input) => {
    const event = new Event("input");
    input.dispatchEvent(event);
  });
}

editProfile.addEventListener("click", () => {
  fillProfileInputs();
  openEditProfilePopup();
});

addButton.addEventListener("click", openAddCardPopup);

// Находим форму в DOM
let formElement = document.querySelector(".popup__form"); // Воспользуйтесь методом querySelector()

// Обработчик «отправки» формы
function formSubmitHandler(evt) {
  evt.preventDefault();

  const submitButton = evt.target.querySelector('button[type="submit"]');
  const originalText = submitButton.textContent;
  submitButton.textContent = 'Сохранение...';
  submitButton.disabled = true;

  const promises = [];

  promises.push(
    setUserInfo({
      name: nameInput.value,
      about: jobInput.value,
    }),
  );

  if (avatarInput.value) {
    promises.push(setUserAvatar(avatarInput.value));
  }

  Promise.all(promises)
    .then(([userData, avatarData]) => {
      userName.textContent = userData.name;
      userJop.textContent = userData.about;
      if (avatarData) {
        const avatar = document.querySelector(".profile__avatar");
        avatar.src = avatarData.avatar;
      }
      closePopup();
    })
    .catch((err) => {
      console.log(err);
    })
    .finally(() => {
      submitButton.textContent = originalText;
      submitButton.disabled = false;
    });
}

// Прикрепляем обработчик к форме:
// он будет следить за событием “submit” - «отправка»
formElement.addEventListener("submit", formSubmitHandler);

// Обработчик формы добавления карточки
function addFormSubmitHandler(evt) {
  evt.preventDefault();

  const submitButton = evt.target.querySelector('button[type="submit"]');
  const originalText = submitButton.textContent;
  submitButton.textContent = 'Создание...';
  submitButton.disabled = true;

  addCard({
    name: cardNameInput.value,
    link: cardLinkInput.value,
  })
    .then((newCard) => {
      const elementsContainer = document.querySelector(".elements");
      const cardTemplate = document.querySelector("#card-template").content;

      const cardElement = createCardElement(
        newCard,
        cardTemplate,
        currentUserId,
        handleInfoClick,
      );
      elementsContainer.appendChild(cardElement);

      closeAddPopup();
      invalidateMainPage();
    })
    .catch((err) => {
      console.log(err);
    })
    .finally(() => {
      submitButton.textContent = originalText;
      submitButton.disabled = false;
    });
}

addForm.addEventListener("submit", addFormSubmitHandler);

const formatDate = (date) =>
  date.toLocaleDateString("ru-RU", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

const createInfoString = (term, description) => {
  const template = document.querySelector("#popup-info-definition-template").content;
  const element = template.cloneNode(true);
  element.querySelector(".popup-info__term").textContent = term;
  element.querySelector(".popup-info__description").textContent = description;
  return element;
};

const createUserChip = (user) => {
  const template = document.querySelector("#popup-info-user-template").content;
  const element = template.cloneNode(true);
  element.querySelector(".popup-info__user-chip").textContent = user.name;
  return element;
};

const openModalWindow = (modal) => modal.classList.add("popup_opened");

const handleInfoClick = (cardId) => {
  getCardList()
    .then((cards) => {
      const cardData = cards.find((card) => card._id === cardId);
      if (!cardData) return;

      const cardInfoModalInfoList = cardInfoPopup.querySelector(".popup-info__list");
      const cardInfoModalLikedList = cardInfoPopup.querySelector(".popup-info__liked-list");

      cardInfoModalInfoList.innerHTML = "";
      cardInfoModalLikedList.innerHTML = "";

      cardInfoModalInfoList.append(
        createInfoString("Описание:", cardData.name)
      );

      cardInfoModalInfoList.append(
        createInfoString("Дата создания:", formatDate(new Date(cardData.createdAt)))
      );

      cardInfoModalInfoList.append(
        createInfoString("Владелец:", cardData.owner.name)
      );

      cardInfoModalInfoList.append(
        createInfoString("Количество лайков:", cardData.likes.length)
      );

      if (cardData.likes.length > 0) {
        cardData.likes.forEach((user) => {
          cardInfoModalLikedList.append(createUserChip(user));
        });
      }

      openModalWindow(cardInfoPopup);
    })
    .catch((err) => {
      console.log(err);
    });
};

let currentUserId = null;

function invalidateMainPage() {
  const elementsContainer = document.querySelector(".elements");
  //  Clear all old cards
  elementsContainer.innerHTML = "";
  Promise.all([getCardList(), getUserInfo()])
    .then(([cards, userData]) => {
      // Код отвечающий за отрисовку полученных данных
      currentUserId = userData._id;
      userName.textContent = userData.name;
      userJop.textContent = userData.about;
      const avatar = document.querySelector(".profile__avatar");
      avatar.src = userData.avatar;

      const cardTemplate = document.querySelector("#card-template").content;

      cards.forEach((card) => {
        const cardElement = createCardElement(
          card,
          cardTemplate,
          currentUserId,
          handleInfoClick,
        );
        elementsContainer.appendChild(cardElement);
      });
    })
    .catch((err) => {
      console.log(err); // В случае возникновения ошибки выводим её в консоль
    });
}

function createCardElement(card, cardTemplate, userId, handleInfoClick) {
  const cardElement = cardTemplate.cloneNode(true);
  const img = cardElement.querySelector(".element__photo");
  img.src = card.link;
  img.alt = "фото";

  const title = cardElement.querySelector(".element__title");
  title.textContent = card.name;

  const likeButton = cardElement.querySelector(".element__heart");

  // Проверяем, лайкали ли мы карточку ранее
  const isLiked = card.likes.some((user) => user._id === userId);
  if (isLiked) {
    likeButton.classList.add("element__heart_active");
  }

  const likeCountElement = cardElement.querySelector(".element__heart-count");
  likeCountElement.textContent = card.likes.length;

  likeButton.addEventListener("click", () => {
    const currentlyLiked = likeButton.classList.contains(
      "element__heart_active",
    );
    changeLikeCardStatus(card._id, currentlyLiked)
      .then((updatedCard) => {
        likeButton.classList.toggle("element__heart_active");
        likeCountElement.textContent = updatedCard.likes.length;
      })
      .catch((err) => {
        console.log(err);
      });
  });

  // Показываем иконку удаления только для своих карточек
  const deleteButton = cardElement.querySelector(".element__delete-button");
  if (card.owner._id !== userId) {
    deleteButton.remove();
  } else {
    deleteButton.addEventListener("click", () => {
      deleteButton.disabled = true;
      deleteCard(card._id)
        .then(() => {
          deleteButton.closest(".element").remove();
        })
        .catch((err) => {
          console.log(err);
          deleteButton.disabled = false;
        });
    });
  }

  // Info button
  const infoButton = cardElement.querySelector(".element__control-button_type_info");
  infoButton.addEventListener("click", () => handleInfoClick(card._id));

  return cardElement;
}

invalidateMainPage();
