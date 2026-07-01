// Phintra Gmail Add-on Apps Script
// This script allows employees to report and analyze suspicious phishing emails directly in Gmail.

var BACKEND_URL = "http://localhost:8001"; // Replace with your production Phintra API URL
var FRONTEND_URL = "http://localhost:5173"; // Replace with your production Phintra Frontend URL
var PHINTRA_ADDON_KEY = "phintra-dev-key-123"; // Replace with your secret addon key

function reportPhishing(e) {
  var gmailEvent = e.gmail;
  var messageId = gmailEvent.messageId;
  
  try {
    // Fetch email details using GmailApp
    var message = GmailApp.getMessageById(messageId);
    var subject = message.getSubject();
    var sender = message.getFrom();
    var body = message.getPlainBody();
    var reportedAt = new Date().toISOString();
    var threadId = message.getThread().getId();
    
    // Fetch active employee email (user's email address)
    var employeeEmail = Session.getActiveUser().getEmail();
    
    // Call backend API POST /gmail/report-email
    var url = BACKEND_URL + "/gmail/report-email";
    
    var payload = {
      "subject": subject,
      "sender": sender,
      "body": body,
      "reported_user_email": employeeEmail,
      "reported_time": reportedAt,
      "employee_email": employeeEmail,
      "message_id": messageId,
      "thread_id": threadId,
      "reported_at": reportedAt
    };
    
    var options = {
      "method": "post",
      "contentType": "application/json",
      "payload": JSON.stringify(payload),
      "muteHttpExceptions": true,
      "headers": {
        "X-PHINTRA-ADDON-KEY": PHINTRA_ADDON_KEY
      }
    };
    
    var response = UrlFetchApp.fetch(url, options);
    var responseCode = response.getResponseCode();
    var responseText = response.getContentText();
    var resData = JSON.parse(responseText);
    
    if (responseCode === 200 && resData.success !== false) {
      resData.employee_email = employeeEmail;
      return buildReportResultCard(resData);
    } else {
      var messageText = "Report failed. Please try again later.";
      if (responseCode === 403) {
        messageText = "Report cancelled. Your email is not registered under this company.";
      }
      return buildReportFailedCard(messageText);
    }
  } catch (err) {
    return buildReportFailedCard("Report failed. Please try again later.");
  }
}

function buildReportResultCard(result) {
  var card = CardService.newCardBuilder();
  
  var header = CardService.newCardHeader()
      .setTitle("Phintra Security Analysis")
      .setSubtitle("Report Result");
  card.setHeader(header);
  
  var section = CardService.newCardSection()
      .setHeader("Status Summary");
      
  section.addWidget(CardService.newTextParagraph().setText("<b>Email reported successfully</b>"));
  
  section.addWidget(CardService.newDecoratedText()
      .setTopLabel("Report Status")
      .setText(result.status || "Reported")
      .setStartIcon(CardService.newIconImage().setIcon(CardService.Icon.EMAIL)));
      
  section.addWidget(CardService.newDecoratedText()
      .setTopLabel("Subject")
      .setText(result.subject || "No Subject"));
      
  section.addWidget(CardService.newDecoratedText()
      .setTopLabel("Sender")
      .setText(result.sender || "Unknown Sender"));
      
  section.addWidget(CardService.newDecoratedText()
      .setTopLabel("Risk Score")
      .setText((result.risk_score || 0) + " / 100")
      .setBottomLabel("Threat Level: " + (result.risk_level || "Low")));

  section.addWidget(CardService.newDecoratedText()
      .setTopLabel("Points Earned")
      .setText("+" + (result.points_added || 0) + " XP")
      .setBottomLabel("Total Score: " + (result.employee_score || 0) + " XP"));
      
  section.addWidget(CardService.newDecoratedText()
      .setTopLabel("Leaderboard Rank")
      .setText("#" + (result.leaderboard_rank || "N/A"))
      .setBottomLabel("Organization: " + (result.company_name || "Phintra"));
      
  card.addSection(section);
  
  if (result.learning_tips && result.learning_tips.length > 0) {
    var tipsSection = CardService.newCardSection().setHeader("Learning Feedback");
    for (var i = 0; i < result.learning_tips.length; i++) {
      tipsSection.addWidget(CardService.newDecoratedText()
          .setText(result.learning_tips[i])
          .setStartIcon(CardService.newIconImage().setIcon(CardService.Icon.DESCRIPTION)));
    }
    card.addSection(tipsSection);
  }
  
  var actionsSection = CardService.newCardSection();
  var dashboardUrl = FRONTEND_URL + "/user/dashboard?token=" + result.dashboard_token;
  
  var openLink = CardService.newOpenLink()
      .setUrl(dashboardUrl)
      .setOpenAs(CardService.OpenAs.FULL_SIZE)
      .setOnClose(CardService.OnClose.NOTHING);
      
  var openDashboardBtn = CardService.newTextButton()
      .setText("Open Dashboard")
      .setOpenLink(openLink);
      
  var messageAdminAction = CardService.newAction()
      .setFunctionName("openMessageAdminCard")
      .setParameters({
        "report_id": String(result.report_id),
        "employee_email": String(result.employee_email || ""),
        "subject": String(result.subject || "")
      });
      
  var messageAdminBtn = CardService.newTextButton()
      .setText("Message Admin")
      .setOnClickAction(messageAdminAction);
      
  var buttonSet = CardService.newButtonSet()
      .addButton(openDashboardBtn)
      .addButton(messageAdminBtn);
      
  actionsSection.addWidget(buttonSet);
  card.addSection(actionsSection);
  
  return card.build();
}

function buildReportFailedCard(message) {
  var card = CardService.newCardBuilder()
      .setHeader(CardService.newCardHeader()
          .setTitle("Report Flagged")
          .setSubtitle("Submission Failed"));
          
  var section = CardService.newCardSection()
      .setHeader("Error Alert");
      
  section.addWidget(CardService.newDecoratedText()
      .setText(message)
      .setStartIcon(CardService.newIconImage().setIcon(CardService.Icon.CONFIRMATION_NUMBER_AND_PIN)));
      
  card.addSection(section);
  return card.build();
}

function openMessageAdminCard(e) {
  var reportId = e.parameters.report_id;
  var employeeEmail = e.parameters.employee_email;
  var subject = e.parameters.subject;
  
  var card = CardService.newCardBuilder()
      .setHeader(CardService.newCardHeader()
          .setTitle("Message Security Administrator")
          .setSubtitle("Report: " + subject));
          
  var section = CardService.newCardSection()
      .setHeader("Feedback Details");
      
  section.addWidget(CardService.newTextParagraph()
      .setText("Report ID: <b>" + reportId + "</b><br>Subject: <b>" + subject + "</b>"));
      
  var messageInput = CardService.newTextInput()
      .setFieldName("admin_message")
      .setTitle("Your Message to Admin")
      .setMultiline(true);
  section.addWidget(messageInput);
  
  var submitAction = CardService.newAction()
      .setFunctionName("submitAdminMessage")
      .setParameters({
        "report_id": reportId,
        "employee_email": employeeEmail
      });
      
  var submitBtn = CardService.newTextButton()
      .setText("Submit Message")
      .setOnClickAction(submitAction);
      
  section.addWidget(submitBtn);
  card.addSection(section);
  
  var navigation = CardService.newNavigation().pushCard(card.build());
  return CardService.newActionResponseBuilder()
      .setNavigation(navigation)
      .build();
}

function submitAdminMessage(e) {
  var reportId = e.parameters.report_id;
  var employeeEmail = e.parameters.employee_email;
  
  var formInputs = e.formInput;
  var messageText = formInputs ? formInputs.admin_message : "";
  
  if (!messageText || !messageText.trim()) {
    return CardService.newActionResponseBuilder()
        .setNotification(CardService.newNotification().setText("Message cannot be empty."))
        .build();
  }
  
  var url = BACKEND_URL + "/gmail/admin-message";
  
  var payload = {
    "employee_email": employeeEmail,
    "report_id": reportId,
    "message": messageText
  };
  
  var options = {
    "method": "post",
    "contentType": "application/json",
    "payload": JSON.stringify(payload),
    "muteHttpExceptions": true,
    "headers": {
      "X-PHINTRA-ADDON-KEY": PHINTRA_ADDON_KEY
    }
  };
  
  try {
    var response = UrlFetchApp.fetch(url, options);
    var responseCode = response.getResponseCode();
    var responseText = response.getContentText();
    var resData = JSON.parse(responseText);
    
    if (responseCode === 200 && resData.success !== false) {
      var navigation = CardService.newNavigation().popCard();
      return CardService.newActionResponseBuilder()
          .setNavigation(navigation)
          .setNotification(CardService.newNotification().setText("Message sent successfully to Admin."))
          .build();
    } else {
      var errorMsg = resData.error || "Failed to deliver message.";
      return CardService.newActionResponseBuilder()
          .setNotification(CardService.newNotification().setText("Error: " + errorMsg))
          .build();
    }
  } catch (err) {
    return CardService.newActionResponseBuilder()
        .setNotification(CardService.newNotification().setText("Connection error. Please try again later."))
        .build();
  }
}
