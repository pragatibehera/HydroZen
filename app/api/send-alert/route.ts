import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { alert, node1Data, node2Data } = body;

    // Configure nodemailer with your email service
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    // Create email content
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.MAINTENANCE_EMAIL,
      subject: `Urgent: Water Leakage Alert - ${alert.severity.toUpperCase()} Severity`,
      html: `
        <h2>Water Leakage Alert</h2>
        <p><strong>Location:</strong> ${alert.location}</p>
        <p><strong>Severity:</strong> ${alert.severity.toUpperCase()}</p>
        <p><strong>Difference:</strong> ${alert.difference.toFixed(1)} units</p>
        <p><strong>Time:</strong> ${new Date(alert.timestamp).toLocaleString()}</p>
        
        <h3>Node Readings</h3>
        <h4>Location 1:</h4>
        <ul>
          <li>Humidity: ${node1Data.predicted_humidity.toFixed(1)}%</li>
          <li>Pressure: ${node1Data.pressure.toFixed(1)} hPa</li>
          <li>Temperature: ${node1Data.Temperature.toFixed(1)}°C</li>
        </ul>
        
        <h4>Location 2:</h4>
        <ul>
          <li>Humidity: ${node2Data.predicted_humidity.toFixed(1)}%</li>
          <li>Pressure: ${node2Data.pressure.toFixed(1)} hPa</li>
          <li>Temperature: ${node2Data.Temperature.toFixed(1)}°C</li>
        </ul>
        
        <p>Please investigate and address this issue immediately.</p>
      `,
    };

    // Send email
    await transporter.sendMail(mailOptions);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error sending alert email:', error);
    return NextResponse.json(
      { error: 'Failed to send alert email' },
      { status: 500 }
    );
  }
} 