import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { TranslateService, TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-help-support',
  templateUrl: './help-support.component.html',
  styleUrls: ['./help-support.component.scss'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, MatIconModule, TranslatePipe],
})
export class HelpSupportComponent implements OnInit {
  supportForm: FormGroup;
  messageSent = false;
  expandedFaq: number | null = null;

  // FAQ items
  faqItems = [
    {
      questionKey: 'help_support.faq.pin_change.question',
      answerKey: 'help_support.faq.pin_change.answer',
    },
    {
      questionKey: 'help_support.faq.transfer_limits.question',
      answerKey: 'help_support.faq.transfer_limits.answer',
    },
    {
      questionKey: 'help_support.faq.unauthorized_transactions.question',
      answerKey: 'help_support.faq.unauthorized_transactions.answer',
    },
    {
      questionKey: 'help_support.faq.lost_card.question',
      answerKey: 'help_support.faq.lost_card.answer',
    },
    {
      questionKey: 'help_support.faq.transfer_processing.question',
      answerKey: 'help_support.faq.transfer_processing.answer',
    },
  ];

  constructor(
    private fb: FormBuilder,
    private translateService: TranslateService
  ) {
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

  // Get translated FAQ question
  getQuestion(questionKey: string): string {
    return this.translateService.instant(questionKey);
  }

  // Get translated FAQ answer
  getAnswer(answerKey: string): string {
    return this.translateService.instant(answerKey);
  }
}
