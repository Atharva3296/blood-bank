function switchPage(pageName) {
  const allPages = document.querySelectorAll(".page-section")
  allPages.forEach((page) => {
    page.classList.remove("active")
  })

  const selectedPage = document.getElementById(pageName + "-page")
  if (selectedPage) {
    selectedPage.classList.add("active")
  }

  const navButtons = document.querySelectorAll(".nav-button")
  navButtons.forEach((button) => {
    button.classList.remove("active")
    if (button.getAttribute("data-page") === pageName) {
      button.classList.add("active")
    }
  })

  if (pageName === "manage-requests") {
    displayAllRequests()
    updatePendingRequestsCount()
  }

  window.scrollTo(0, 0)
}

document.querySelectorAll(".nav-button").forEach((button) => {
  button.addEventListener("click", function () {
    const pageName = this.getAttribute("data-page")
    switchPage(pageName)
  })
})

const donorRegistrationForm = document.getElementById("donor-registration-form")

if (donorRegistrationForm) {
  donorRegistrationForm.addEventListener("submit", (event) => {
    event.preventDefault()

    const donorData = {
      firstName: document.getElementById("donor-first-name").value,
      lastName: document.getElementById("donor-last-name").value,
      email: document.getElementById("donor-email").value,
      phone: document.getElementById("donor-phone").value,
      age: document.getElementById("donor-age").value,
      bloodType: document.getElementById("donor-blood-type").value,
      gender: document.getElementById("donor-gender").value,
      weight: document.getElementById("donor-weight").value,
      address: document.getElementById("donor-address").value,
      medicalHistory: document.getElementById("donor-medical-history").checked,
    }

    if (!validateDonorData(donorData)) {
      showNotification("Please fill all required fields correctly", "error")
      return
    }

    saveDonorToLocalStorage(donorData)

    addActivityToRecent(
      "Donation",
      `${donorData.firstName} ${donorData.lastName} registered as donor with ${donorData.bloodType} blood`,
    )

    showNotification("Donor registered successfully!", "success")

    donorRegistrationForm.reset()

    setTimeout(() => {
      switchPage("dashboard")
    }, 2000)
  })
}

function validateDonorData(data) {
  if (!data.firstName || !data.lastName || !data.email || !data.phone) {
    return false
  }
  if (data.age < 18 || data.age > 65) {
    return false
  }
  if (!data.bloodType || !data.gender || !data.weight) {
    return false
  }
  if (!data.medicalHistory) {
    return false
  }
  return true
}

function saveDonorToLocalStorage(donorData) {
  const donors = JSON.parse(localStorage.getItem("bloodBankDonors")) || []
  donorData.registrationDate = new Date().toISOString()
  donorData.donorId = "DONOR-" + Date.now()
  donors.push(donorData)
  localStorage.setItem("bloodBankDonors", JSON.stringify(donors))
}

const bloodRequestForm = document.getElementById("blood-request-form")

if (bloodRequestForm) {
  bloodRequestForm.addEventListener("submit", (event) => {
    event.preventDefault()

    const requestData = {
      hospitalName: document.getElementById("request-hospital-name").value,
      contactPerson: document.getElementById("request-contact-person").value,
      phone: document.getElementById("request-phone").value,
      email: document.getElementById("request-email").value,
      bloodType: document.getElementById("request-blood-type").value,
      units: document.getElementById("request-units").value,
      requiredDate: document.getElementById("request-date").value,
      urgency: document.getElementById("request-urgency").value,
      reason: document.getElementById("request-reason").value,
    }

    if (!validateRequestData(requestData)) {
      showNotification("Please fill all required fields correctly", "error")
      return
    }

    saveRequestToLocalStorage(requestData)

    addActivityToRecent(
      "Request",
      `${requestData.contactPerson} requested ${requestData.units} units of ${requestData.bloodType} blood`,
    )

    showNotification("Blood request submitted successfully!", "success")

    bloodRequestForm.reset()

    updatePendingRequestsCount()

    setTimeout(() => {
      switchPage("dashboard")
    }, 2000)
  })
}

function validateRequestData(data) {
  if (!data.hospitalName || !data.contactPerson || !data.phone || !data.email) {
    return false
  }
  if (!data.bloodType || !data.units || !data.requiredDate || !data.urgency) {
    return false
  }
  if (data.units < 1) {
    return false
  }
  return true
}

function saveRequestToLocalStorage(requestData) {
  const requests = JSON.parse(localStorage.getItem("bloodBankRequests")) || []
  requestData.requestDate = new Date().toISOString()
  requestData.requestId = "REQ-" + Date.now()
  requestData.status = "Pending"
  requests.push(requestData)
  localStorage.setItem("bloodBankRequests", JSON.stringify(requests))
}

function displayAllRequests() {
  const requests = JSON.parse(localStorage.getItem("bloodBankRequests")) || []
  const requestsList = document.getElementById("requests-list")

  if (!requestsList) return

  if (requests.length === 0) {
    requestsList.innerHTML = '<p class="empty-message">No blood requests yet</p>'
    return
  }

  requestsList.innerHTML = ""

  requests.forEach((request) => {
    const requestCard = document.createElement("div")
    requestCard.className = "request-card"
    requestCard.innerHTML = `
      <div class="request-header">
        <div class="request-info">
          <h4 class="request-hospital">${request.hospitalName}</h4>
          <p class="request-id">Request ID: ${request.requestId}</p>
        </div>
        <span class="request-status status-${request.status.toLowerCase()}">${request.status}</span>
      </div>
      <div class="request-details">
        <div class="detail-row">
          <span class="detail-label">Contact Person:</span>
          <span class="detail-value">${request.contactPerson}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Phone:</span>
          <span class="detail-value">${request.phone}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Email:</span>
          <span class="detail-value">${request.email}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Blood Type:</span>
          <span class="detail-value blood-type-highlight">${request.bloodType}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Units Required:</span>
          <span class="detail-value">${request.units}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Required Date:</span>
          <span class="detail-value">${request.requiredDate}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Urgency:</span>
          <span class="detail-value urgency-${request.urgency.toLowerCase()}">${request.urgency}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Reason:</span>
          <span class="detail-value">${request.reason}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Request Date:</span>
          <span class="detail-value">${new Date(request.requestDate).toLocaleString()}</span>
        </div>
      </div>
      <div class="request-actions">
        <button class="approve-button" onclick="updateRequestStatus('${request.requestId}', 'Approved')">Approve</button>
        <button class="reject-button" onclick="updateRequestStatus('${request.requestId}', 'Rejected')">Reject</button>
        <button class="delete-button" onclick="deleteRequest('${request.requestId}')">Delete</button>
      </div>
    `
    requestsList.appendChild(requestCard)
  })
}

function updateRequestStatus(requestId, newStatus) {
  const requests = JSON.parse(localStorage.getItem("bloodBankRequests")) || []
  const requestIndex = requests.findIndex((req) => req.requestId === requestId)

  if (requestIndex !== -1) {
    requests[requestIndex].status = newStatus
    localStorage.setItem("bloodBankRequests", JSON.stringify(requests))
    displayAllRequests()
    updatePendingRequestsCount()
    showNotification(`Request ${newStatus.toLowerCase()} successfully!`, "success")
  }
}

function deleteRequest(requestId) {
  if (confirm("Are you sure you want to delete this request?")) {
    let requests = JSON.parse(localStorage.getItem("bloodBankRequests")) || []
    requests = requests.filter((req) => req.requestId !== requestId)
    localStorage.setItem("bloodBankRequests", JSON.stringify(requests))
    displayAllRequests()
    updatePendingRequestsCount()
    showNotification("Request deleted successfully!", "success")
  }
}

function updatePendingRequestsCount() {
  const requests = JSON.parse(localStorage.getItem("bloodBankRequests")) || []
  const pendingCount = requests.filter((req) => req.status === "Pending").length
  const countElement = document.getElementById("pending-requests-count")
  if (countElement) {
    countElement.textContent = pendingCount
  }
}

function addActivityToRecent(activityType, description) {
  const activityList = document.querySelector(".activity-list")

  if (!activityList) return

  const newActivityItem = document.createElement("div")
  newActivityItem.className = "activity-item"
  newActivityItem.innerHTML = `
    <span class="activity-type">${activityType}</span>
    <span class="activity-description">${description}</span>
    <span class="activity-time">just now</span>
  `

  activityList.insertBefore(newActivityItem, activityList.firstChild)

  const allActivities = activityList.querySelectorAll(".activity-item")
  if (allActivities.length > 10) {
    allActivities[allActivities.length - 1].remove()
  }
}

function performSearch() {
  const selectedBloodType = document.getElementById("search-blood-type").value

  const resultCards = document.querySelectorAll(".result-card")

  resultCards.forEach((card) => {
    if (selectedBloodType === "") {
      card.style.display = "block"
    } else {
      const cardBloodType = card.querySelector(".result-blood-type").textContent.trim()
      if (cardBloodType === selectedBloodType) {
        card.style.display = "block"
      } else {
        card.style.display = "none"
      }
    }
  })

  showNotification("Search completed", "info")
}

function showNotification(message, type = "info") {
  const notification = document.createElement("div")
  notification.className = `notification notification-${type}`
  notification.textContent = message

  notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 1rem 1.5rem;
        border-radius: 0.375rem;
        font-weight: 500;
        z-index: 1000;
        animation: slideIn 0.3s ease;
        max-width: 400px;
    `

  if (type === "success") {
    notification.style.backgroundColor = "#10b981"
    notification.style.color = "white"
  } else if (type === "error") {
    notification.style.backgroundColor = "#ef4444"
    notification.style.color = "white"
  } else if (type === "info") {
    notification.style.backgroundColor = "#3b82f6"
    notification.style.color = "white"
  }

  document.body.appendChild(notification)

  setTimeout(() => {
    notification.style.animation = "slideOut 0.3s ease"
    setTimeout(() => {
      notification.remove()
    }, 300)
  }, 3000)
}

const style = document.createElement("style")
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }

    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
`
document.head.appendChild(style)

const logoutButton = document.querySelector(".logout-button")
if (logoutButton) {
  logoutButton.addEventListener("click", () => {
    if (confirm("Are you sure you want to logout?")) {
      showNotification("Logged out successfully", "success")
      setTimeout(() => {}, 1500)
    }
  })
}

document.addEventListener("DOMContentLoaded", () => {
  updatePendingRequestsCount()
  switchPage("dashboard")
})
