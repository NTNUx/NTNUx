<template>
  <DefaultHeader />

  <slot />

  <DefaultFooter />
</template>

<script setup>
import { DefaultHeader, DefaultFooter } from "#components";
</script>
