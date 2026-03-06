import {
  getCardList,
  getUserInfo,
  setUserInfo,
  setUserAvatar,
  addCard,
  deleteCard,
  changeLikeCardStatus,
} from "./components/api.js";
import {
  enableValidation,
  clearValidation,
} from "./components/validation.js";

const validationConfig = {
  formSelector: '.popup__form',
  inputSelector: '.popup__input',
  submitButtonSelector: '.popup__save-button',
  inactiveButtonClass: 'popup__save-button_disabled',
  inputErrorClass: 'popup__input_type_error',
  errorClass: 'popup__error_visible'
};

const popups = document.querySelectorAll(".popup");
const editProfilePopup = document.querySelector("#edit-profile-popup");
const editAvatarPopup = document.querySelector("#edit-avatar-popup");
const addPopup = document.querySelector("#add-card-popup");
const cardInfoPopup = document.querySelector("#card-info-popup");
const imagePopup = document.querySelector("#image-popup");
const popupImage = imagePopup.querySelector(".popup__image");
const popupCaption = imagePopup.querySelector(".popup__caption");

const editProfile = document.querySelector(".edit-profile"); //переменная открыть редактирование профиля
const avatarEditButton = document.querySelector(".profile__avatar-edit-button");
const userName = document.querySelector(".profile__user-name"); //переменная касса имени профиля на странице
const userJop = document.querySelector(".profile__user-jop"); //переменная касса работы на странице

const addButton = document.querySelector(".add-button"); //переменная кнопки добавить
const addForm = addPopup.querySelector(".popup__form_add");

const nameInput = editProfilePopup.querySelector(".popup__user-name"); // Воспользуйтесь инструментом .querySelector()
const jobInput = editProfilePopup.querySelector(".popup__user-jop"); // Воспользуйтесь инструментом .querySelector()
const avatarInput = editAvatarPopup.querySelector(".popup__user-avatar");

const cardNameInput = addPopup.querySelector(".popup__card-name");
const cardLinkInput = addPopup.querySelector(".popup__card-link");


const closeByEsc = (evt) => {
  if (evt.key === "Escape") {
    const openedPopup = document.querySelector(".popup_opened");
    if (openedPopup) {
      closeModalWindow(openedPopup);
    }
  }
};

const openModalWindow = (modal) => {
  modal.classList.add("popup_opened");
  document.addEventListener("keydown", closeByEsc);
};

const closeModalWindow = (modal) => {
  modal.classList.remove("popup_opened");
  document.removeEventListener("keydown", closeByEsc);
};

function openEditProfilePopup() {
  clearValidation(editProfilePopup, validationConfig);
  openModalWindow(editProfilePopup);
}

function openEditAvatarPopup() {
  avatarInput.value = "";
  clearValidation(editAvatarPopup, validationConfig);
  openModalWindow(editAvatarPopup);
}

function openAddCardPopup() {
  addForm.reset();
  clearValidation(addPopup, validationConfig);
  openModalWindow(addPopup);
}

function closePopup() {
  closeModalWindow(editProfilePopup);
}

function closeAvatarPopup() {
  closeModalWindow(editAvatarPopup);
}

function closeAddPopup() {
  closeModalWindow(addPopup);
}

popups.forEach((popup) => {
  popup.addEventListener("mousedown", (evt) => {
    if (evt.target.classList.contains("popup_opened")) {
      closeModalWindow(popup);
    }
    if (evt.target.classList.contains("popup__close-button")) {
      closeModalWindow(popup);
    }
  });
});

enableValidation(validationConfig);

function fillProfileInputs() {
  nameInput.value = userName.textContent;
  jobInput.value = userJop.textContent;
}

editProfile.addEventListener("click", () => {
  fillProfileInputs();
  openEditProfilePopup();
});

avatarEditButton.addEventListener("click", () => {
  openEditAvatarPopup();
});

addButton.addEventListener("click", openAddCardPopup);

// Находим форму в DOM
let formElement = document.querySelector(".popup__form"); // Воспользуйтесь методом querySelector()

// Обработчик «отправки» формы профиля
function formSubmitHandler(evt) {
  evt.preventDefault();

  const submitButton = evt.target.querySelector('button[type="submit"]');
  const originalText = submitButton.textContent;
  submitButton.textContent = "Сохранение...";
  submitButton.disabled = true;

  setUserInfo({
    name: nameInput.value,
    about: jobInput.value,
  })
    .then((userData) => {
      userName.textContent = userData.name;
      userJop.textContent = userData.about;
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

// Обработчик обновления аватара
function avatarFormSubmitHandler(evt) {
  evt.preventDefault();

  const submitButton = evt.target.querySelector('button[type="submit"]');
  const originalText = submitButton.textContent;
  submitButton.textContent = "Сохранение...";
  submitButton.disabled = true;

  setUserAvatar(avatarInput.value)
    .then((userData) => {
      const avatar = document.querySelector(".profile__avatar");
      avatar.src = userData.avatar;
      closeAvatarPopup();
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
formElement.addEventListener("submit", formSubmitHandler);

const avatarForm = editAvatarPopup.querySelector(".popup__form");
avatarForm.addEventListener("submit", avatarFormSubmitHandler);

function addFormSubmitHandler(evt) {
  evt.preventDefault();

  const submitButton = evt.target.querySelector('button[type="submit"]');
  const originalText = submitButton.textContent;
  submitButton.textContent = "Создание...";
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
      elementsContainer.prepend(cardElement);

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
  const template = document.querySelector(
    "#popup-info-definition-template",
  ).content;
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

const handleInfoClick = (cardId) => {
  getCardList()
    .then((cards) => {
      const cardData = cards.find((card) => card._id === cardId);
      if (!cardData) return;

      const cardInfoModalInfoList =
        cardInfoPopup.querySelector(".popup-info__list");
      const cardInfoModalLikedList = cardInfoPopup.querySelector(
        ".popup-info__liked-list",
      );

      cardInfoModalInfoList.innerHTML = "";
      cardInfoModalLikedList.innerHTML = "";

      cardInfoModalInfoList.append(
        createInfoString("Описание:", cardData.name),
      );

      cardInfoModalInfoList.append(
        createInfoString(
          "Дата создания:",
          formatDate(new Date(cardData.createdAt)),
        ),
      );

      cardInfoModalInfoList.append(
        createInfoString("Владелец:", cardData.owner.name),
      );

      cardInfoModalInfoList.append(
        createInfoString("Количество лайков:", cardData.likes.length),
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
      console.log(err);
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

  // delete only owned
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

  // info button
  const infoButton = cardElement.querySelector(
    ".element__control-button_type_info",
  );
  infoButton.addEventListener("click", () => handleInfoClick(card._id));

  // image click
  img.addEventListener("click", () => {
    popupImage.src = card.link;
    popupImage.alt = card.name;
    popupCaption.textContent = card.name;
    openModalWindow(imagePopup);
  });

  return cardElement;
}

invalidateMainPage();
