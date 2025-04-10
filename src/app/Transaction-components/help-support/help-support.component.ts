import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-help-support',
  templateUrl: './help-support.component.html',
  styleUrls: ['./help-support.component.scss'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, MatIconModule],
})
export class HelpSupportComponent implements OnInit {
  supportForm: FormGroup;
  messageSent = false;
  expandedFaq: number | null = null;

  // FAQ items
  faqItems = [
    {
      question: 'How do I change my PIN?',
      answer:
        'Contact out customer support team and they will be able to generate a new pin for your account',
    },
    {
      question: 'What are the daily transfer limits?',
      answer:
        'The standard daily transfer limit is Ksh 10,000. However, this may vary depending on your account type and standing. You can view your specific limit in your Account Information page under the Account Details tab. If you need a temporary increase, please contact customer support.',
    },
    {
      question: 'What should I do if I notice unauthorized transactions?',
      answer:
        "If you notice any unauthorized transactions, you should immediately: 1) Lock your account through the Security menu; 2) Contact our 24/7 support line at +(254)-98-466-352; 3) Report the incident by filling out the form in the Security section of your dashboard. We'll investigate the issue and respond within 24 hours.",
    },
    {
      question: 'How do I report a lost or stolen card?',
      answer:
        'To report a lost or stolen card, please call our emergency support line at +(254)-98-466-352 immediately. You can also lock your card temporarily through the Account Information page. After reporting, a new card will be issued and delivered to your registered address within 5-7 business days.',
    },
    {
      question: 'How long does it take for transfers to process?',
      answer:
        'Internal transfers between accounts within our bank are processed immediately. Transfers to other banks typically process within 1-2 business days, depending on the receiving bank and the time of transaction.',
    },
  ];

  constructor(private fb: FormBuilder) {
    this.supportForm = this.fb.group({
      message: ['', [Validators.required, Validators.minLength(10)]],
    });
  }

  ngOnInit(): void {}

  submitSupportMessage() {
    if (this.supportForm.valid) {
      // Here you would typically send the message to the server
      console.log('Support message submitted:', this.supportForm.value.message);

      // Show success message
      this.messageSent = true;

      // Reset form after submission
      this.supportForm.reset();

      // Hide success message after 5 seconds
      setTimeout(() => {
        this.messageSent = false;
      }, 5000);
    }
  }

  toggleFaq(index: number) {
    if (this.expandedFaq === index) {
      this.expandedFaq = null; // Collapse if already expanded
    } else {
      this.expandedFaq = index; // Expand the selected FAQ
    }
  }
}
