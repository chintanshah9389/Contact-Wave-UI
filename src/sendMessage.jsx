import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./sendMessage.css";
import {
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
  Button,
  TextareaAutosize,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";
import { CheckCircle, Cancel } from "@mui/icons-material";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import Navbar from "./navbar";

const SendMessage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isTestMessage } = location.state || {};
  const { selectedRows } = location.state || {};

  const [message, setMessage] = useState("");
  const [header, setHeader] = useState("");
  const [category, setCategory] = useState("");
  const [sendMode, setSendMode] = useState("whatsapp");
  const [results, setResults] = useState([]);
  const [showReportButton, setShowReportButton] = useState(false);
  const [showReportPopup, setShowReportPopup] = useState(false);
  const [headers, setHeaders] = useState([]); // Store headers dynamically
  const [activeSpreadsheetId, setActiveSpreadsheetId] = useState(null); // Store active spreadsheet ID
  const [files, setFiles] = useState([]);
  const [filePreviews, setFilePreviews] = useState([]);
  const [testMobileNumber, setTestMobileNumber] = useState("");
  const [messageType, setMessageType] = useState("text"); // Default value

  const apiUrl1 =
    process.env.NODE_ENV === "development"
      ? process.env.REACT_APP_LOCAL_API_URL
      : process.env.REACT_APP_PRODUCTION_API_URL;

  // Fetch headers and active spreadsheet ID
  useEffect(() => {
    const fetchHeaders = async () => {
      try {
        // Fetch the active spreadsheet ID
        const activeSpreadsheetResponse = await axios.get(
          `${apiUrl1}/get-active-spreadsheet`,
          {
            withCredentials: true,
          }
        );
        const activeSpreadsheetId =
          activeSpreadsheetResponse.data.activeSpreadsheetId;

        if (!activeSpreadsheetId) {
          toast.error(
            "No active spreadsheet found. Please set an active spreadsheet first."
          );
          return;
        }

        setActiveSpreadsheetId(activeSpreadsheetId);

        // Fetch headers dynamically
        const headersResponse = await axios.get(
          `${apiUrl1}/get-spreadsheet-headers`,
          {
            params: { spreadsheetId: activeSpreadsheetId },
            withCredentials: true,
          }
        );
        const allHeaders = headersResponse.data.headers;

        if (!allHeaders || allHeaders.length === 0) {
          toast.error("No headers found in the spreadsheet.");
          return;
        }

        setHeaders(allHeaders);
      } catch (error) {
        console.error("Error fetching headers:", error);
        toast.error("Failed to fetch headers. Please try again.");
      }
    };

    fetchHeaders();
  }, []);

  // Dynamically identify column indices
  const getColumnIndex = (headerName) => {
    return headers.indexOf(headerName);
  };

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);

    let validFiles = selectedFiles.filter((file) => {
      if (messageType === "image") return file.type.startsWith("image/");
      if (messageType === "video") return file.type.startsWith("video/");
      return false;
    });

    if (validFiles.length !== selectedFiles.length) {
      toast.error(`Only ${messageType} files are allowed.`);
    }

    setFiles(validFiles);
    setFilePreviews(validFiles.map((file) => URL.createObjectURL(file)));
  };

  const handleSendMessage = async () => {
    if (!message.trim() && files.length === 0) {
      toast.error("Please enter a message or attach at least one file.");
      return;
    }

    if (isTestMessage && !testMobileNumber.trim()) {
      toast.error("Please enter a mobile number for the test message.");
      return;
    }

    if (!isTestMessage && (!selectedRows || selectedRows.length === 0)) {
      toast.error("Please select at least one recipient.");
      return;
    }

    const mobileColumnVariants = [
      "mobilenumber",
      "mobile no",
      "Mobile Number",
      "MobileNumber",
      "MOB",
      "mob",
      "mobile number",
      "mobileno",
    ];

    let formattedRecipients;

    if (isTestMessage) {
      formattedRecipients = [
        {
          // firstName: 'Test',
          // middleName: '',
          // lastName: 'User',
          phone: testMobileNumber.trim(),
          // email: '',
          // uniqueId: 'test',
        },
      ];
    } else {
      formattedRecipients = selectedRows.map((row) => {
        const firstNameIndex = getColumnIndex("First Name");
        const middleNameIndex = getColumnIndex("Middle Name");
        const lastNameIndex = getColumnIndex("Surname");
        // const phoneIndex = getColumnIndex('mobilenumber');
        const emailIndex = getColumnIndex("Email Address");
        const uniqueIdIndex = getColumnIndex("Unique ID");

        let phone = "";
        for (let variant of mobileColumnVariants) {
          const phoneIndex = getColumnIndex(variant);
          if (phoneIndex !== -1) {
            phone = row[phoneIndex]?.trim() || "";
            break; // Stop as soon as we find a match
          }
          console.log("Phone Column Index:", phoneIndex);
        }

        return {
          firstName: firstNameIndex !== -1 ? row[firstNameIndex] : "",
          middleName: middleNameIndex !== -1 ? row[middleNameIndex] : "",
          lastName: lastNameIndex !== -1 ? row[lastNameIndex] : "",
          phone: phone,
          email: emailIndex !== -1 ? row[emailIndex] : "",
          uniqueId: uniqueIdIndex !== -1 ? row[uniqueIdIndex] : "",
        };
      });
    }

    const apiUrl =
      sendMode === "sms"
        ? `${apiUrl1}/send-sms`
        : sendMode === "whatsapp"
        ? `${apiUrl1}/send-whatsapp`
        : `${apiUrl1}/send-telegram`;

    const formData = new FormData();
    formData.append("header", header);
    formData.append("message", message);
    formData.append("recipients", JSON.stringify(formattedRecipients));
    formData.append("activeSpreadsheetId", activeSpreadsheetId);
    files.forEach((file, index) => {
      formData.append(`files`, file);
    });

    try {
      const response = await axios.post(apiUrl, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setResults(response.data.results);
      setShowReportButton(true);
      toast.success(response.data.message);
    } catch (error) {
      console.error(`Error sending ${sendMode} messages:`, error);
      toast.error(`Failed to send ${sendMode} messages.`);
    }
  };

  const handleShowReport = () => {
    setShowReportPopup(true); // Open the report popup
  };

  const handleCloseReportPopup = () => {
    setShowReportPopup(false); // Close the report popup
  };

  const handleDownloadPDF = () => {
    const input = document.getElementById("report-table"); // Get the table element
    html2canvas(input).then((canvas) => {
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4"); // Create a PDF in portrait mode
      const imgWidth = 210; // A4 width in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width; // Calculate height
      pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
      pdf.save("report.pdf"); // Download the PDF
    });
  };

  const socket = new WebSocket('ws://yourserver.com:5001');

socket.onopen = () => {
    console.log('Connected to WebSocket server');
};

socket.onmessage = (event) => {
    const message = JSON.parse(event.data);
    console.log('Received message:', message);
    // Update your frontend UI with the received message
    displayMessage(message);
};

socket.onerror = (error) => {
    console.error('WebSocket error:', error);
};

function displayMessage(message) {
    // Example: Append the message to a chat window
    const chatWindow = document.getElementById('chat-window');
    const messageElement = document.createElement('div');
    messageElement.textContent = message.text.body;
    chatWindow.appendChild(messageElement);
}

  return (
    <>
      <ToastContainer autoClose={3000} />
      <Navbar />
      <div className="send-message-container">
        <h2>Send Messages</h2>
        {isTestMessage && (
          <input
            type="text"
            placeholder="Mobile No"
            className="mobile-input"
            value={testMobileNumber}
            onChange={(e) => setTestMobileNumber(e.target.value)}
            style={{
              width: "100%",
              height: "40px",
              marginBottom: "20px",
              fontSize: "16px",
              padding: "10px",
              borderRadius: "5px",
              border: "1px solid #ccc",
            }}
          />
        )}
        {/* <TextareaAutosize
          placeholder="Enter your message here"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          style={{
            width: "100%",
            height: "100px",
            marginBottom: "20px",
            fontSize: "16px",
            padding: "10px",
            borderRadius: "5px",
            border: "1px solid #ccc",
          }}
        />
        <input
          type="file"
          multiple
          onChange={handleFileChange}
          style={{ marginBottom: "20px" }}
          accept="image/*" // Only allow image files
        />
        <div className="image-previews">
          {filePreviews.map((preview, index) => (
            <img
              key={index}
              src={preview}
              alt={`Preview ${index}`}
              style={{ width: "100px", height: "100px", margin: "5px" }}
            />
          ))}
        </div>
        <select
          value={messageType}
          onChange={(e) => setMessageType(e.target.value)}
          style={{
            width: "100%",
            padding: "10px",
            marginBottom: "20px",
            fontSize: "16px",
            borderRadius: "5px",
            border: "1px solid #ccc",
          }}
        >
          <option value="text">Text Only</option>
          <option value="image">Message with Image</option>
          <option value="video">Message with Video</option>
        </select> */}

        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          style={{
            width: "100%",
            padding: "10px",
            marginBottom: "20px",
            fontSize: "16px",
            borderRadius: "5px",
            border: "1px solid #ccc",
          }}
        >
          <option value="">Select Category</option>
          <option value="marketing">Marketing</option>
          <option value="utility">Utility</option>
          <option value="authentication">Authentication</option>
          <option value="otpless">OTPLess</option>
        </select>

        {/* Marketing: Show Message Type Dropdown */}
        {category === "marketing" && (
          <select
            value={messageType}
            onChange={(e) => setMessageType(e.target.value)}
            style={{
              width: "100%",
              padding: "10px",
              marginBottom: "20px",
              fontSize: "16px",
              borderRadius: "5px",
              border: "1px solid #ccc",
            }}
          >
            <option value="text">Text Only</option>
            <option value="image">Message with Image</option>
            <option value="video">Message with Video</option>
          </select>
        )}

        {/* Show Message Textbox */}
        {(category === "marketing" || category === "utility") && (
           <> 
           {/* <label style={{ fontSize: "16px", fontWeight: "bold" }}>Header</label> */}
           { messageType === "text" && (        
        <input
        type="text"
        placeholder="Enter header"
        name="header"
        className="header-input"
        value={header}
        onChange={(e) => {
    setHeader(e.target.value);
    console.log("Header input:", e.target.value); // Log the entered header
  }}
        style={{
          width: "100%",
          height: "40px",
          marginBottom: "20px",
          fontSize: "16px",
          padding: "10px",
          borderRadius: "5px",
          border: "1px solid #ccc",
        }}
      />
      )}
          <TextareaAutosize
            placeholder="Enter your message here"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            style={{
              width: "100%",
              height: "100px",
              marginBottom: "20px",
              fontSize: "16px",
              padding: "10px",
              borderRadius: "5px",
              border: "1px solid #ccc",
            }}
          />
          </>
        )}

        {/* Show File Upload for Marketing (Image/Video) */}
        {category === "marketing" && messageType !== "text" && (
          <>
            <input
              type="file"
              multiple
              onChange={handleFileChange}
              style={{ marginBottom: "20px" }}
              accept={messageType === "image" ? "image/*" : "video/*"}
            />
            <div className="image-previews">
              {filePreviews.map((preview, index) => (
                <img
                  key={index}
                  src={preview}
                  alt={`Preview ${index}`}
                  style={{ width: "100px", height: "100px", margin: "5px" }}
                />
              ))}
            </div>
          </>
        )}

        <FormControl component="fieldset" className="send-mode-selector">
          <FormLabel component="legend">Send via</FormLabel>
          <RadioGroup
            row
            value={sendMode}
            onChange={(e) => setSendMode(e.target.value)}
          >
            <FormControlLabel value="sms" control={<Radio />} label="SMS" />
            <FormControlLabel
              value="whatsapp"
              control={<Radio />}
              label="WhatsApp"
            />
            <FormControlLabel
              value="telegram"
              control={<Radio />}
              label="Telegram"
            />
          </RadioGroup>
        </FormControl>
        <div className="actions">
          <Button
            variant="contained"
            color="primary"
            onClick={handleSendMessage}
          >
            Send
          </Button>
          <Button
            variant="outlined"
            onClick={() => navigate("/create-message")}
          >
            Cancel
          </Button>
        </div>

        {/* Show Report Button */}
        {showReportButton && (
          <div className="report-button-container">
            <Button
              variant="contained"
              color="secondary"
              onClick={handleShowReport}
              style={{ marginTop: "20px" }}
            >
              Show Report
            </Button>
          </div>
        )}

        {/* Report Popup */}
        <Dialog
          open={showReportPopup}
          onClose={handleCloseReportPopup}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>Message Report</DialogTitle>
          <DialogContent>
            <TableContainer component={Paper} id="report-table">
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>First Name</TableCell>
                    <TableCell>Middle Name</TableCell>
                    <TableCell>Last Name</TableCell>
                    <TableCell>Mobile</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Message Sent</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {results.map((result, index) => (
                    <TableRow key={index}>
                      <TableCell>{result.firstName}</TableCell>
                      <TableCell>{result.middleName}</TableCell>
                      <TableCell>{result.lastName}</TableCell>
                      <TableCell>{result.phone}</TableCell>
                      <TableCell>{result.email}</TableCell>
                      <TableCell>
                        {result.status === "success" ? (
                          <CheckCircle style={{ color: "green" }} />
                        ) : (
                          <Cancel style={{ color: "red" }} />
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseReportPopup} color="primary">
              Close
            </Button>
            <Button onClick={handleDownloadPDF} color="primary">
              Download PDF
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    </>
  );
};

export default SendMessage;