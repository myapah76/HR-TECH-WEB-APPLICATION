package sba301.hrtech.payment.dtos.request;

import java.util.UUID;

public record CreatePaymentRequest(
         UUID subscriptionPlanId
) {}
